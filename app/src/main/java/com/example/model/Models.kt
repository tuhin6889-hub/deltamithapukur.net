package com.example.model

import kotlinx.serialization.Serializable

enum class UserRole {
    MANAGER, NOC, CLIENT
}

enum class TicketStatus(val label: String, val labelBn: String) {
    Open("Open", "নতুন টিকেট"),
    NOC_Assigned("NOC Assigned", "নোক ইঞ্জিনিয়ার নিয়োজিত"),
    In_Progress("In Progress", "সমাধান প্রক্রিয়াধীন"),
    Resolved("Resolved", "সমাধানকৃত"),
    Closed("Closed", "বন্ধ")
}

enum class TicketPriority(val label: String, val labelBn: String) {
    Urgent("Urgent", "জরুরি (Urgent)"),
    High("High", "উচ্চ (High)"),
    Medium("Medium", "মাঝারি (Medium)"),
    Low("Low", "সাধারণ (Low)")
}

val TICKET_CATEGORIES = listOf(
    "ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)",
    "রেড এলওএস বাতি (Red LOS Light)",
    "উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)",
    "রাউটার ও কনফিগারেশন (Router / Config)",
    "বিলিং ও পেমেন্ট (Billing & Payment)",
    "সংযোগ স্থানান্তর (Shift Connection)",
    "অন্যান্য (Others)"
)

@Serializable
data class CommentItem(
    val id: String,
    val author: String,
    val role: String, // "Client", "NOC", "Manager", "System"
    val text: String,
    val timestamp: String
)

@Serializable
data class AiDiagnosis(
    val summaryBengali: String,
    val nocSteps: List<String>,
    val clientReplyBengali: String,
    val recommendedPriority: String
)

@Serializable
data class Ticket(
    val id: String,
    val cid: String,
    val clientName: String,
    val clientPhone: String,
    val clientAddress: String,
    val area: String,
    val packageSpeed: String,
    val category: String,
    val title: String,
    val description: String,
    val status: TicketStatus,
    val priority: TicketPriority,
    val assignedNoc: String? = null,
    val createdDate: String,
    val updatedDate: String,
    val comments: List<CommentItem> = emptyList(),
    val opticalPower: String = "-21.5 dBm",
    val pingMs: Int = 24,
    val rating: Int? = null,
    val feedback: String? = null,
    val aiDiagnosis: AiDiagnosis? = null,
    val resolutionNote: String? = null
)

@Serializable
data class ClientInfo(
    val cid: String,
    val name: String,
    val phone: String,
    val email: String,
    val address: String,
    val area: String,
    val packageName: String,
    val ipAddress: String,
    val onuMac: String,
    val opticalPower: String,
    val balance: Double = 0.0,
    val status: String = "Active" // "Active", "Suspended"
)

@Serializable
data class NocStaff(
    val id: String,
    val name: String,
    val designation: String,
    val phone: String,
    val area: String,
    val status: String = "On Duty", // "On Duty", "On Field", "Off Duty"
    val activeTickets: Int = 0,
    val completedToday: Int = 0
)

@Serializable
data class NotificationLog(
    val id: String,
    val ticketId: String,
    val cid: String,
    val channel: String, // "WhatsApp", "Email", "SMS"
    val recipient: String,
    val recipientType: String, // "Manager", "NOC", "Client"
    val title: String,
    val message: String,
    val timestamp: String,
    val status: String = "Delivered"
)
