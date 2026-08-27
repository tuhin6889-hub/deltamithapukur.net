package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.*
import com.example.ui.components.*
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManagerDashboardScreen(
    tickets: List<Ticket>,
    clients: List<ClientInfo>,
    staffList: List<NocStaff>,
    isBengali: Boolean,
    onSelectTicket: (Ticket) -> Unit,
    onOpenNewTicketDialog: () -> Unit,
    onOpenNewClientDialog: () -> Unit,
    onOpenClientDbDialog: () -> Unit,
    onOpenWhatsAppDialog: () -> Unit,
    onOpenEmailDialog: () -> Unit,
    onOpenNotificationsDialog: () -> Unit,
    onUpdateStatus: (String, TicketStatus) -> Unit,
    onAssignNoc: (String, String) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedStatusFilter by remember { mutableStateOf<String>("ALL") }
    var selectedAreaFilter by remember { mutableStateOf<String>("ALL") }

    // Quick Assign Dialog state
    var assigningTicketId by remember { mutableStateOf<String?>(null) }
    var changingStatusTicketId by remember { mutableStateOf<String?>(null) }

    val filteredTickets = remember(tickets, searchQuery, selectedStatusFilter, selectedAreaFilter) {
        tickets.filter { ticket ->
            val matchesSearch = searchQuery.isBlank() ||
                    ticket.id.contains(searchQuery, ignoreCase = true) ||
                    ticket.cid.contains(searchQuery, ignoreCase = true) ||
                    ticket.clientName.contains(searchQuery, ignoreCase = true) ||
                    ticket.title.contains(searchQuery, ignoreCase = true) ||
                    ticket.clientPhone.contains(searchQuery, ignoreCase = true)

            val matchesStatus = when (selectedStatusFilter) {
                "ALL" -> true
                "URGENT" -> ticket.priority == TicketPriority.Urgent
                "OPEN" -> ticket.status == TicketStatus.Open
                "NOC_ASSIGNED" -> ticket.status == TicketStatus.NOC_Assigned
                "IN_PROGRESS" -> ticket.status == TicketStatus.In_Progress
                "RESOLVED" -> ticket.status == TicketStatus.Resolved
                "CLOSED" -> ticket.status == TicketStatus.Closed
                else -> true
            }

            val matchesArea = selectedAreaFilter == "ALL" || ticket.area.contains(selectedAreaFilter, ignoreCase = true)

            matchesSearch && matchesStatus && matchesArea
        }
    }

    val openCount = tickets.count { it.status == TicketStatus.Open }
    val inProgressCount = tickets.count { it.status == TicketStatus.In_Progress || it.status == TicketStatus.NOC_Assigned }
    val resolvedCount = tickets.count { it.status == TicketStatus.Resolved || it.status == TicketStatus.Closed }
    val urgentCount = tickets.count { it.priority == TicketPriority.Urgent && it.status != TicketStatus.Closed }

    Scaffold(
        containerColor = DeepDarkBackground,
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onOpenNewTicketDialog,
                containerColor = IndigoPrimary,
                contentColor = Color.White,
                icon = { Icon(Icons.Default.Add, contentDescription = "Add Ticket") },
                text = { Text(if (isBengali) "নতুন টিকেট" else "New Ticket", fontWeight = FontWeight.Bold) },
                modifier = Modifier.testTag("fab_new_ticket")
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 12.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header Stats Banner
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (isBengali) "ব্রাঞ্চ ম্যানেজার কন্ট্রোল রুম" else "Branch Manager Control Room",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Text(
                            text = if (isBengali) "মিঠাপুকুর সদর ও জোনাল সাপোর্ট ম্যানেজমেন্ট" else "Mithapukur HQ & Zonal Support Dispatch",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        IconButton(
                            onClick = onOpenNewClientDialog,
                            modifier = Modifier
                                .size(36.dp)
                                .background(SurfaceVariantDark, CircleShape)
                                .testTag("btn_register_client")
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = "Add Client", tint = CyanAccent, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }

            // Metric KPI Cards Grid
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Total Tickets
                    MetricCard(
                        title = if (isBengali) "মোট টিকেট" else "Total Tickets",
                        value = "${tickets.size}",
                        color = IndigoPrimary,
                        modifier = Modifier.weight(1f)
                    )
                    // Urgent/Open
                    MetricCard(
                        title = if (isBengali) "জরুরি / ওপেন" else "Urgent / Open",
                        value = "$urgentCount / $openCount",
                        color = if (urgentCount > 0) RoseError else AmberWarning,
                        modifier = Modifier.weight(1f)
                    )
                    // In Progress
                    MetricCard(
                        title = if (isBengali) "প্রক্রিয়াধীন" else "In Progress",
                        value = "$inProgressCount",
                        color = CyanAccent,
                        modifier = Modifier.weight(1f)
                    )
                    // Resolved
                    MetricCard(
                        title = if (isBengali) "সমাধানকৃত" else "Resolved",
                        value = "$resolvedCount",
                        color = EmeraldSuccess,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Quick Hub Action Bar
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, CardBorderColor)))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HubQuickButton(
                            icon = Icons.Default.Group,
                            label = if (isBengali) "গ্রাহক ডাটাবেজ" else "Subscribers",
                            color = CyanAccent,
                            onClick = onOpenClientDbDialog
                        )
                        HubQuickButton(
                            icon = Icons.Default.Chat,
                            label = if (isBengali) "হোয়াটসঅ্যাপ API" else "WhatsApp API",
                            color = EmeraldSuccess,
                            onClick = onOpenWhatsAppDialog
                        )
                        HubQuickButton(
                            icon = Icons.Default.Email,
                            label = if (isBengali) "ইমেইল সার্ভিস" else "Email Alerts",
                            color = IndigoLight,
                            onClick = onOpenEmailDialog
                        )
                        HubQuickButton(
                            icon = Icons.Default.History,
                            label = if (isBengali) "লগ ইতিহাস" else "Audit Logs",
                            color = AmberWarning,
                            onClick = onOpenNotificationsDialog
                        )
                    }
                }
            }

            // Search Bar & Filter Chips
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("manager_search_input"),
                        placeholder = { Text(if (isBengali) "টিকেট আইডি, CID, নাম বা ফোন দিয়ে খুঁজুন..." else "Search by Ticket ID, CID, Name, Phone...", fontSize = 12.sp, color = TextMuted) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(18.dp)) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Close, contentDescription = "Clear", tint = TextMuted, modifier = Modifier.size(16.dp))
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp)
                    )

                    // Status Filter Chips
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        contentPadding = PaddingValues(vertical = 2.dp)
                    ) {
                        val filterOptions = listOf(
                            "ALL" to if (isBengali) "সকল টিকেট (${tickets.size})" else "All (${tickets.size})",
                            "URGENT" to if (isBengali) "🚨 জরুরি ($urgentCount)" else "🚨 Urgent ($urgentCount)",
                            "OPEN" to if (isBengali) "নতুন ওপেন ($openCount)" else "Open ($openCount)",
                            "IN_PROGRESS" to if (isBengali) "প্রক্রিয়াধীন ($inProgressCount)" else "In Progress ($inProgressCount)",
                            "RESOLVED" to if (isBengali) "সমাধানকৃত ($resolvedCount)" else "Resolved ($resolvedCount)"
                        )

                        items(filterOptions) { (key, label) ->
                            FilterChip(
                                selected = selectedStatusFilter == key,
                                onClick = { selectedStatusFilter = key },
                                label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                                colors = FilterChipDefaults.filterChipColors(
                                    containerColor = SurfaceDark,
                                    selectedContainerColor = IndigoPrimary,
                                    labelColor = TextSecondary,
                                    selectedLabelColor = Color.White
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    borderColor = CardBorderColor,
                                    selectedBorderColor = IndigoPrimary,
                                    enabled = true,
                                    selected = selectedStatusFilter == key
                                )
                            )
                        }
                    }
                }
            }

            // Ticket List
            if (filteredTickets.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.Inbox, contentDescription = null, tint = TextMuted, modifier = Modifier.size(48.dp))
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = if (isBengali) "কোন টিকেট পাওয়া যায়নি" else "No tickets match your filter criteria",
                                color = TextSecondary,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            } else {
                items(filteredTickets, key = { it.id }) { ticket ->
                    TicketCardItem(
                        ticket = ticket,
                        isBengali = isBengali,
                        onClick = { onSelectTicket(ticket) },
                        onQuickAssign = { assigningTicketId = ticket.id },
                        onQuickStatus = { changingStatusTicketId = ticket.id }
                    )
                }
            }
        }
    }

    // Quick Assign Dialog
    if (assigningTicketId != null) {
        val targetTicketId = assigningTicketId!!
        AlertDialog(
            onDismissRequest = { assigningTicketId = null },
            containerColor = SurfaceDark,
            title = {
                Text(
                    text = if (isBengali) "ফিল্ড ইঞ্জিনিয়ার / স্কোয়াড অ্যাসাইন করুন" else "Assign Field Squad / Engineer",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(staffList) { staff ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onAssignNoc(targetTicketId, "${staff.id} (${staff.name})")
                                    assigningTicketId = null
                                },
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceVariantDark
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(text = staff.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                    Text(text = "${staff.id} • ${staff.designation}", fontSize = 11.sp, color = TextSecondary)
                                    Text(text = "এলাকা: ${staff.area}", fontSize = 10.sp, color = CyanAccent)
                                }
                                Surface(
                                    color = if (staff.status == "On Field") Color(0xFF4C0519) else Color(0xFF064E3B),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = staff.status,
                                        fontSize = 9.sp,
                                        color = if (staff.status == "On Field") RoseError else EmeraldSuccess,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { assigningTicketId = null }) {
                    Text(if (isBengali) "বাতিল" else "Cancel", color = TextSecondary)
                }
            }
        )
    }

    // Quick Status Changer Dialog
    if (changingStatusTicketId != null) {
        val targetTicketId = changingStatusTicketId!!
        AlertDialog(
            onDismissRequest = { changingStatusTicketId = null },
            containerColor = SurfaceDark,
            title = {
                Text(
                    text = if (isBengali) "টিকেট স্ট্যাটাস পরিবর্তন করুন" else "Change Ticket Status",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    TicketStatus.values().forEach { status ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onUpdateStatus(targetTicketId, status)
                                    changingStatusTicketId = null
                                },
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceVariantDark
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = if (isBengali) status.labelBn else status.label,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                TicketStatusBadge(status = status, isBengali = isBengali)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { changingStatusTicketId = null }) {
                    Text(if (isBengali) "বাতিল" else "Cancel", color = TextSecondary)
                }
            }
        )
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, color.copy(alpha = 0.3f))))
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = title, fontSize = 10.sp, color = TextSecondary, maxLines = 1)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = value, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = color)
        }
    }
}

@Composable
fun HubQuickButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    color: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .background(color.copy(alpha = 0.15f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = label, fontSize = 10.sp, color = TextPrimary, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun TicketCardItem(
    ticket: Ticket,
    isBengali: Boolean,
    onClick: () -> Unit,
    onQuickAssign: () -> Unit,
    onQuickStatus: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .testTag("ticket_card_${ticket.id}"),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, if (ticket.priority == TicketPriority.Urgent) RoseError.copy(alpha = 0.5f) else CardBorderColor)))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Row 1: ID, Priority, Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = ticket.id,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    TicketPriorityBadge(priority = ticket.priority, isBengali = isBengali)
                }

                TicketStatusBadge(status = ticket.status, isBengali = isBengali)
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 2: Title & Category
            Text(
                text = ticket.title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )

            Text(
                text = ticket.category,
                fontSize = 11.sp,
                color = CyanAccent,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Row 3: Client Info & Area
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = TextMuted, modifier = Modifier.size(13.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${ticket.clientName} (${ticket.cid})",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
                Text(
                    text = ticket.area,
                    fontSize = 10.sp,
                    color = TextMuted
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Row 4: Optical Signal, Ping, and Quick Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OpticalSignalIndicator(power = ticket.opticalPower)
                    PingLatencyIndicator(pingMs = ticket.pingMs)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Quick NOC button
                    FilledTonalButton(
                        onClick = onQuickAssign,
                        modifier = Modifier.height(30.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp),
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = SurfaceVariantDark, contentColor = IndigoLight)
                    ) {
                        Icon(Icons.Default.AssignmentInd, contentDescription = null, modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (ticket.assignedNoc != null) ticket.assignedNoc.take(8) + ".." else (if (isBengali) "নোক" else "NOC"),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Quick Status button
                    FilledTonalButton(
                        onClick = onQuickStatus,
                        modifier = Modifier.height(30.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp),
                        colors = ButtonDefaults.filledTonalButtonColors(containerColor = SurfaceVariantDark, contentColor = CyanAccent)
                    ) {
                        Icon(Icons.Default.ChangeCircle, contentDescription = null, modifier = Modifier.size(13.dp))
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(if (isBengali) "স্ট্যাটাস" else "Status", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
