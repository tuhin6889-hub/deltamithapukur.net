package com.example.data

import com.example.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

class DeltaRepository {
    private val _tickets = MutableStateFlow<List<Ticket>>(MockData.initialTickets)
    val tickets: StateFlow<List<Ticket>> = _tickets.asStateFlow()

    private val _clients = MutableStateFlow<List<ClientInfo>>(MockData.initialClients)
    val clients: StateFlow<List<ClientInfo>> = _clients.asStateFlow()

    private val _nocStaff = MutableStateFlow<List<NocStaff>>(MockData.initialStaff)
    val nocStaff: StateFlow<List<NocStaff>> = _nocStaff.asStateFlow()

    private val _notifications = MutableStateFlow<List<NotificationLog>>(MockData.initialNotifications)
    val notifications: StateFlow<List<NotificationLog>> = _notifications.asStateFlow()

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())

    fun createTicket(
        cid: String,
        clientName: String,
        clientPhone: String,
        clientAddress: String,
        area: String,
        packageSpeed: String,
        category: String,
        title: String,
        description: String,
        priority: TicketPriority,
        opticalPower: String = "-21.5 dBm",
        pingMs: Int = 24
    ): Ticket {
        val nowStr = dateFormat.format(Date())
        val newId = "T-2026-${String.format(Locale.US, "%03d", _tickets.value.size + 1)}"
        val newTicket = Ticket(
            id = newId,
            cid = cid,
            clientName = clientName,
            clientPhone = clientPhone,
            clientAddress = clientAddress,
            area = area,
            packageSpeed = packageSpeed,
            category = category,
            title = title,
            description = description,
            status = TicketStatus.Open,
            priority = priority,
            createdDate = nowStr,
            updatedDate = nowStr,
            opticalPower = opticalPower,
            pingMs = pingMs,
            comments = listOf(
                CommentItem(
                    id = "c_${System.currentTimeMillis()}",
                    author = clientName,
                    role = "Client",
                    text = "টিকেট দাখিল করা হয়েছে: $title",
                    timestamp = nowStr
                )
            )
        )

        _tickets.value = listOf(newTicket) + _tickets.value

        // Outbound automated notification log
        sendNotification(
            ticketId = newId,
            cid = cid,
            channel = "WhatsApp",
            recipient = "Manager & NOC Squad ($area)",
            recipientType = "Manager",
            title = "🚨 New Support Ticket #$newId ($priority)",
            message = "[$category] $clientName ($cid, $clientPhone): $title"
        )
        sendNotification(
            ticketId = newId,
            cid = cid,
            channel = "SMS",
            recipient = "$clientName ($clientPhone)",
            recipientType = "Client",
            title = "Delta Ticket Confirmation",
            message = "প্রিয় $clientName, আপনার টিকেট #$newId গ্রহণ করা হয়েছে। দ্রুত সমাধান করতে নোক টিম যোগাযোগ করবে।"
        )

        return newTicket
    }

    fun updateTicketStatus(ticketId: String, newStatus: TicketStatus, authorRole: String = "Manager") {
        val nowStr = dateFormat.format(Date())
        var targetCid = "CID-1001"
        var targetName = "Client"

        _tickets.value = _tickets.value.map { ticket ->
            if (ticket.id == ticketId) {
                targetCid = ticket.cid
                targetName = ticket.clientName
                val commentAuthor = when (authorRole) {
                    "MANAGER" -> "ব্রাঞ্চ ম্যানেজার"
                    "NOC" -> "নোক টিম"
                    else -> "সিস্টেম"
                }
                ticket.copy(
                    status = newStatus,
                    updatedDate = nowStr,
                    comments = ticket.comments + CommentItem(
                        id = "c_${System.currentTimeMillis()}",
                        author = commentAuthor,
                        role = if (authorRole == "MANAGER") "Manager" else if (authorRole == "NOC") "NOC" else "System",
                        text = "স্ট্যাটাস পরিবর্তন: ${newStatus.labelBn}",
                        timestamp = nowStr
                    )
                )
            } else {
                ticket
            }
        }

        // Send alert notification
        sendNotification(
            ticketId = ticketId,
            cid = targetCid,
            channel = "WhatsApp",
            recipient = targetName,
            recipientType = "Client",
            title = "টিকেট স্ট্যাটাস আপডেট: #${ticketId}",
            message = "প্রিয় গ্রাহক, আপনার টিকেট #${ticketId} এর বর্তমান স্ট্যাটাস: ${newStatus.labelBn}"
        )
    }

    fun assignNoc(ticketId: String, staffName: String) {
        val nowStr = dateFormat.format(Date())
        var targetCid = "CID-1001"

        _tickets.value = _tickets.value.map { ticket ->
            if (ticket.id == ticketId) {
                targetCid = ticket.cid
                ticket.copy(
                    assignedNoc = staffName,
                    status = TicketStatus.NOC_Assigned,
                    updatedDate = nowStr,
                    comments = ticket.comments + CommentItem(
                        id = "c_${System.currentTimeMillis()}",
                        author = "ব্রাঞ্চ ম্যানেজার",
                        role = "Manager",
                        text = "ফিল্ড ইঞ্জিনিয়ার অ্যাসাইন করা হয়েছে: $staffName",
                        timestamp = nowStr
                    )
                )
            } else {
                ticket
            }
        }

        sendNotification(
            ticketId = ticketId,
            cid = targetCid,
            channel = "WhatsApp",
            recipient = "$staffName (NOC)",
            recipientType = "NOC",
            title = "New Field Assignment: #$ticketId",
            message = "আপনাকে টিকেট #$ticketId এর দায়িত্বে নিয়োজিত করা হয়েছে। গ্রাহকের সাথে অবিলম্বে যোগাযোগ করুন।"
        )
    }

    fun addComment(ticketId: String, author: String, role: String, text: String) {
        val nowStr = dateFormat.format(Date())
        _tickets.value = _tickets.value.map { ticket ->
            if (ticket.id == ticketId) {
                ticket.copy(
                    updatedDate = nowStr,
                    comments = ticket.comments + CommentItem(
                        id = "c_${System.currentTimeMillis()}",
                        author = author,
                        role = role,
                        text = text,
                        timestamp = nowStr
                    )
                )
            } else {
                ticket
            }
        }
    }

    fun submitFeedback(ticketId: String, rating: Int, feedback: String) {
        val nowStr = dateFormat.format(Date())
        _tickets.value = _tickets.value.map { ticket ->
            if (ticket.id == ticketId) {
                ticket.copy(
                    rating = rating,
                    feedback = feedback,
                    status = TicketStatus.Closed,
                    updatedDate = nowStr
                )
            } else {
                ticket
            }
        }
    }

    fun attachAiDiagnosis(ticketId: String, diagnosis: AiDiagnosis) {
        _tickets.value = _tickets.value.map { ticket ->
            if (ticket.id == ticketId) {
                ticket.copy(aiDiagnosis = diagnosis)
            } else {
                ticket
            }
        }
    }

    fun addClient(newClient: ClientInfo) {
        _clients.value = listOf(newClient) + _clients.value
        sendNotification(
            ticketId = newClient.cid,
            cid = newClient.cid,
            channel = "WhatsApp",
            recipient = "${newClient.name} (${newClient.phone})",
            recipientType = "Client",
            title = "New Subscriber Registered",
            message = "[DELTA MITHAPUKUR] স্বাগতম ${newClient.name}! আপনার ইন্টারনেট সংযোগ (${newClient.packageName}, IP: ${newClient.ipAddress}) সফলভাবে নিবন্ধিত হয়েছে।"
        )
    }

    fun sendNotification(
        ticketId: String,
        cid: String,
        channel: String,
        recipient: String,
        recipientType: String,
        title: String,
        message: String
    ) {
        val nowStr = dateFormat.format(Date())
        val log = NotificationLog(
            id = "N-${System.currentTimeMillis().toString().takeLast(4)}",
            ticketId = ticketId,
            cid = cid,
            channel = channel,
            recipient = recipient,
            recipientType = recipientType,
            title = title,
            message = message,
            timestamp = nowStr,
            status = "Delivered"
        )
        _notifications.value = listOf(log) + _notifications.value
    }
}
