package com.example

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.example.data.DeltaRepository
import com.example.data.GeminiService
import com.example.model.*
import com.example.ui.components.AppTopBar
import com.example.ui.dialogs.*
import com.example.ui.screens.ClientPortalScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.ManagerDashboardScreen
import com.example.ui.screens.NocPortalScreen
import com.example.ui.theme.DeepDarkBackground
import com.example.ui.theme.DeltaSupportTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val repository = DeltaRepository()
    private val geminiService = GeminiService()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            DeltaSupportTheme {
                val tickets by repository.tickets.collectAsState()
                val clients by repository.clients.collectAsState()
                val nocStaff by repository.nocStaff.collectAsState()
                val notifications by repository.notifications.collectAsState()

                var currentRole by remember { mutableStateOf<UserRole?>(null) }
                var activeCid by remember { mutableStateOf<String?>("CID-1003") }
                var activeUserName by remember { mutableStateOf<String?>("কামাল হোসেন") }
                var isBengali by remember { mutableStateOf(true) }

                // Dialog states
                var selectedTicketId by remember { mutableStateOf<String?>(null) }
                var showNewTicketDialog by remember { mutableStateOf(false) }
                var showNewClientDialog by remember { mutableStateOf(false) }
                var showClientDbDialog by remember { mutableStateOf(false) }
                var showWhatsAppDialog by remember { mutableStateOf(false) }
                var showEmailDialog by remember { mutableStateOf(false) }
                var showNotificationsDialog by remember { mutableStateOf(false) }
                var workOrderTicketId by remember { mutableStateOf<String?>(null) }
                var isAiLoading by remember { mutableStateOf(false) }

                val coroutineScope = rememberCoroutineScope()

                val activeTicket = remember(tickets, selectedTicketId) {
                    tickets.find { it.id == selectedTicketId }
                }

                val activeWorkOrderTicket = remember(tickets, workOrderTicketId) {
                    tickets.find { it.id == workOrderTicketId }
                }

                val activeClientInfo = remember(clients, activeCid) {
                    clients.find { it.cid == activeCid } ?: clients.firstOrNull() ?: ClientInfo("CID-1001", "গ্রাহক", "01700-000000", "test@delta.com", "মিঠাপুকুর", "মিঠাপুকুর সদর", "20 Mbps", "103.145.22.10", "00:11:22", "-21.5 dBm")
                }

                Scaffold(
                    containerColor = DeepDarkBackground,
                    topBar = {
                        AppTopBar(
                            currentRole = currentRole,
                            activeUserName = activeUserName,
                            isBengali = isBengali,
                            onToggleLang = { isBengali = !isBengali },
                            onOpenNotifications = { showNotificationsDialog = true },
                            onOpenWhatsAppCenter = { showWhatsAppDialog = true },
                            onOpenEmailCenter = { showEmailDialog = true },
                            onOpenClientDb = { showClientDbDialog = true },
                            onLogout = {
                                currentRole = null
                                activeCid = null
                                activeUserName = null
                                Toast.makeText(this@MainActivity, if (isBengali) "লগআউট সফল হয়েছে" else "Logged out successfully", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .background(DeepDarkBackground)
                    ) {
                        when (currentRole) {
                            null -> {
                                LoginScreen(
                                    clients = clients,
                                    isBengali = isBengali,
                                    onClientLogin = { inputCidOrPhone ->
                                        val matched = clients.find {
                                            it.cid.equals(inputCidOrPhone, ignoreCase = true) ||
                                            it.phone.contains(inputCidOrPhone)
                                        }
                                        if (matched != null) {
                                            activeCid = matched.cid
                                            activeUserName = matched.name
                                            currentRole = UserRole.CLIENT
                                            Toast.makeText(this@MainActivity, "স্বাগতম ${matched.name} (${matched.cid})", Toast.LENGTH_SHORT).show()
                                        } else {
                                            // Dynamic client fallback
                                            activeCid = inputCidOrPhone.uppercase()
                                            activeUserName = "গ্রাহক ($inputCidOrPhone)"
                                            currentRole = UserRole.CLIENT
                                            Toast.makeText(this@MainActivity, "স্বাগতম! ডেল্টা ক্লায়েন্ট পোর্টালে সংযুক্ত।", Toast.LENGTH_SHORT).show()
                                        }
                                    },
                                    onManagerLogin = { user, pass ->
                                        currentRole = UserRole.MANAGER
                                        activeUserName = "ব্রাঞ্চ ম্যানেজার"
                                        Toast.makeText(this@MainActivity, "ব্রাঞ্চ ম্যানেজার প্যানেলে স্বাগতম!", Toast.LENGTH_SHORT).show()
                                    },
                                    onNocLogin = { user, pass ->
                                        currentRole = UserRole.NOC
                                        activeUserName = "NOC Engineer"
                                        Toast.makeText(this@MainActivity, "নোক কন্ট্রোল রুমে স্বাগতম!", Toast.LENGTH_SHORT).show()
                                    }
                                )
                            }

                            UserRole.MANAGER -> {
                                ManagerDashboardScreen(
                                    tickets = tickets,
                                    clients = clients,
                                    staffList = nocStaff,
                                    isBengali = isBengali,
                                    onSelectTicket = { ticket -> selectedTicketId = ticket.id },
                                    onOpenNewTicketDialog = { showNewTicketDialog = true },
                                    onOpenNewClientDialog = { showNewClientDialog = true },
                                    onOpenClientDbDialog = { showClientDbDialog = true },
                                    onOpenWhatsAppDialog = { showWhatsAppDialog = true },
                                    onOpenEmailDialog = { showEmailDialog = true },
                                    onOpenNotificationsDialog = { showNotificationsDialog = true },
                                    onUpdateStatus = { tId, newSt ->
                                        repository.updateTicketStatus(tId, newSt, authorRole = "MANAGER")
                                        Toast.makeText(this@MainActivity, "স্ট্যাটাস আপডেট সম্পন্ন", Toast.LENGTH_SHORT).show()
                                    },
                                    onAssignNoc = { tId, staffName ->
                                        repository.assignNoc(tId, staffName)
                                        Toast.makeText(this@MainActivity, "নোক ইঞ্জিনিয়ার অ্যাসাইন করা হয়েছে", Toast.LENGTH_SHORT).show()
                                    }
                                )
                            }

                            UserRole.NOC -> {
                                NocPortalScreen(
                                    tickets = tickets,
                                    staffList = nocStaff,
                                    isBengali = isBengali,
                                    onSelectTicket = { ticket -> selectedTicketId = ticket.id },
                                    onOpenWorkOrder = { ticket -> workOrderTicketId = ticket.id },
                                    onUpdateStatus = { tId, newSt ->
                                        repository.updateTicketStatus(tId, newSt, authorRole = "NOC")
                                        Toast.makeText(this@MainActivity, "নোক স্ট্যাটাস আপডেট সম্পন্ন", Toast.LENGTH_SHORT).show()
                                    }
                                )
                            }

                            UserRole.CLIENT -> {
                                ClientPortalScreen(
                                    client = activeClientInfo,
                                    tickets = tickets,
                                    isBengali = isBengali,
                                    onSelectTicket = { ticket -> selectedTicketId = ticket.id },
                                    onOpenNewTicketDialog = { showNewTicketDialog = true }
                                )
                            }
                        }
                    }
                }

                // Ticket Detail Dialog
                if (activeTicket != null) {
                    TicketDetailDialog(
                        ticket = activeTicket!!,
                        currentRole = currentRole ?: UserRole.CLIENT,
                        staffList = nocStaff,
                        isBengali = isBengali,
                        onDismiss = { selectedTicketId = null },
                        onAddComment = { author, role, text ->
                            repository.addComment(activeTicket!!.id, author, role, text)
                        },
                        onUpdateStatus = { newSt ->
                            repository.updateTicketStatus(activeTicket!!.id, newSt, authorRole = currentRole?.name ?: "CLIENT")
                            Toast.makeText(this@MainActivity, "স্ট্যাটাস আপডেট করা হয়েছে", Toast.LENGTH_SHORT).show()
                        },
                        onAssignNoc = { staffName ->
                            repository.assignNoc(activeTicket!!.id, staffName)
                            Toast.makeText(this@MainActivity, "$staffName কে অ্যাসাইন করা হয়েছে", Toast.LENGTH_SHORT).show()
                        },
                        onTriggerAiDiagnosis = {
                            val currentT = activeTicket!!
                            isAiLoading = true
                            coroutineScope.launch {
                                val diagnosis = geminiService.diagnoseTicket(
                                    category = currentT.category,
                                    title = currentT.title,
                                    description = currentT.description,
                                    clientName = currentT.clientName,
                                    area = currentT.area,
                                    opticalPower = currentT.opticalPower,
                                    pingMs = currentT.pingMs
                                )
                                repository.attachAiDiagnosis(currentT.id, diagnosis)
                                isAiLoading = false
                                Toast.makeText(this@MainActivity, "AI নোক ডায়াগনস্টিক সম্পন্ন হয়েছে!", Toast.LENGTH_SHORT).show()
                            }
                        },
                        isAiLoading = isAiLoading,
                        onSubmitFeedback = { rating, feedback ->
                            repository.submitFeedback(activeTicket!!.id, rating, feedback)
                            Toast.makeText(this@MainActivity, "রেটিং ও ফিডব্যাকের জন্য ধন্যবাদ!", Toast.LENGTH_SHORT).show()
                        },
                        onSendNotification = { channel, recipient, msg ->
                            repository.sendNotification(
                                ticketId = activeTicket!!.id,
                                cid = activeTicket!!.cid,
                                channel = channel,
                                recipient = recipient,
                                recipientType = "Client",
                                title = "Delta Alert: #${activeTicket!!.id}",
                                message = msg
                            )
                            Toast.makeText(this@MainActivity, "$channel অ্যালার্ট সফলভাবে পাঠানো হয়েছে!", Toast.LENGTH_SHORT).show()
                        }
                    )
                }

                // New Ticket Dialog
                if (showNewTicketDialog) {
                    NewTicketDialog(
                        clients = clients,
                        defaultCid = activeCid,
                        isBengali = isBengali,
                        onDismiss = { showNewTicketDialog = false },
                        onSubmit = { cid, clientName, phone, address, area, packageSpeed, category, title, description, priority, opticalPower, pingMs ->
                            val created = repository.createTicket(
                                cid = cid,
                                clientName = clientName,
                                clientPhone = phone,
                                clientAddress = address,
                                area = area,
                                packageSpeed = packageSpeed,
                                category = category,
                                title = title,
                                description = description,
                                priority = priority,
                                opticalPower = opticalPower,
                                pingMs = pingMs
                            )
                            showNewTicketDialog = false
                            selectedTicketId = created.id
                            Toast.makeText(this@MainActivity, "টিকেট #${created.id} সফলভাবে তৈরি হয়েছে!", Toast.LENGTH_LONG).show()
                        }
                    )
                }

                // New Client Dialog
                if (showNewClientDialog) {
                    NewClientDialog(
                        isBengali = isBengali,
                        onDismiss = { showNewClientDialog = false },
                        onSubmit = { newClient ->
                            repository.addClient(newClient)
                            showNewClientDialog = false
                            Toast.makeText(this@MainActivity, "নতুন গ্রাহক ${newClient.name} (${newClient.cid}) নিবন্ধিত হয়েছে!", Toast.LENGTH_LONG).show()
                        }
                    )
                }

                // Client DB Dialog
                if (showClientDbDialog) {
                    ClientDatabaseDialog(
                        clients = clients,
                        isBengali = isBengali,
                        onDismiss = { showClientDbDialog = false },
                        onOpenNewClient = {
                            showClientDbDialog = false
                            showNewClientDialog = true
                        }
                    )
                }

                // WhatsApp Center Dialog
                if (showWhatsAppDialog) {
                    WhatsAppCenterDialog(
                        isBengali = isBengali,
                        onDismiss = { showWhatsAppDialog = false },
                        onSendBroadcast = { channel, recipient, message ->
                            repository.sendNotification(
                                ticketId = "BROADCAST",
                                cid = "BULK",
                                channel = channel,
                                recipient = recipient,
                                recipientType = "Client",
                                title = "Delta WhatsApp Broadcast",
                                message = message
                            )
                        }
                    )
                }

                // Email Center Dialog
                if (showEmailDialog) {
                    EmailCenterDialog(
                        isBengali = isBengali,
                        onDismiss = { showEmailDialog = false },
                        onSendEmailAlert = { channel, recipient, message ->
                            repository.sendNotification(
                                ticketId = "EMAIL-DISPATCH",
                                cid = "ALL",
                                channel = channel,
                                recipient = recipient,
                                recipientType = "Client",
                                title = "Delta Official Email",
                                message = message
                            )
                        }
                    )
                }

                // Notifications Dialog
                if (showNotificationsDialog) {
                    NotificationHistoryDialog(
                        logs = notifications,
                        isBengali = isBengali,
                        onDismiss = { showNotificationsDialog = false }
                    )
                }

                // Work Order Dialog
                if (activeWorkOrderTicket != null) {
                    WorkOrderDialog(
                        ticket = activeWorkOrderTicket!!,
                        isBengali = isBengali,
                        onDismiss = { workOrderTicketId = null }
                    )
                }
            }
        }
    }
}
