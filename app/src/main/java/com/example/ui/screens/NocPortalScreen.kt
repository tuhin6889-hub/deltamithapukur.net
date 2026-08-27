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

@Composable
fun NocPortalScreen(
    tickets: List<Ticket>,
    staffList: List<NocStaff>,
    isBengali: Boolean,
    onSelectTicket: (Ticket) -> Unit,
    onOpenWorkOrder: (Ticket) -> Unit,
    onUpdateStatus: (String, TicketStatus) -> Unit
) {
    var selectedFilter by remember { mutableStateOf("ACTIVE") }

    val activeTickets = remember(tickets, selectedFilter) {
        when (selectedFilter) {
            "ACTIVE" -> tickets.filter { it.status != TicketStatus.Resolved && it.status != TicketStatus.Closed }
            "LOS_URGENT" -> tickets.filter { it.priority == TicketPriority.Urgent || it.category.contains("LOS") || it.opticalPower.contains("-3") }
            "IN_PROGRESS" -> tickets.filter { it.status == TicketStatus.In_Progress }
            "RESOLVED" -> tickets.filter { it.status == TicketStatus.Resolved || it.status == TicketStatus.Closed }
            else -> tickets
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepDarkBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 40.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // NOC Header Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(EmeraldSuccess.copy(alpha = 0.5f), CyanAccent.copy(alpha = 0.3f))))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(EmeraldSuccess, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isBengali) "নোক ও ফিল্ড ইঞ্জিনিয়ারিং কনসোল" else "NOC & Field Engineering Console",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (isBengali) "অপটিক্যাল স্প্লাইসিং ও ২৪/৭ ফাইবার মনিটরিং" else "Optical Fiber Splicing & 24/7 Live Monitoring",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }

                    Surface(
                        color = Color(0xFF064E3B),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.WifiTethering, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("OLT Active", fontSize = 10.sp, color = EmeraldSuccess, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Section 1: Field Tech Squads & Splicing Units
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = if (isBengali) "👷‍♂️ ফিল্ড টেক স্কোয়াড ও স্প্লাইসিং টিম" else "👷‍♂️ Field Tech Squads & Duty Splicers",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(vertical = 2.dp)
                ) {
                    items(staffList) { staff ->
                        Card(
                            modifier = Modifier.width(220.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                            border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, CardBorderColor)))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        color = if (staff.status == "On Field") Color(0xFF4C0519) else Color(0xFF064E3B),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = staff.status,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (staff.status == "On Field") RoseError else EmeraldSuccess,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }

                                    Text(
                                        text = "${staff.activeTickets} Active",
                                        fontSize = 10.sp,
                                        color = AmberWarning,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = staff.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = TextPrimary,
                                    maxLines = 1
                                )

                                Text(
                                    text = staff.designation,
                                    fontSize = 10.sp,
                                    color = TextSecondary,
                                    maxLines = 1
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(11.dp))
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = staff.area,
                                        fontSize = 9.sp,
                                        color = CyanAccent,
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Section 2: Filterable Ticket Queue
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = if (isBengali) "🔧 অপটিক্যাল টিকেট ও ফিল্ড টাস্ক কিউ" else "🔧 Optical Tickets & Field Task Queue",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )

                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    val filterChips = listOf(
                        "ACTIVE" to if (isBengali) "সক্রিয় কিউ (${tickets.count { it.status != TicketStatus.Resolved && it.status != TicketStatus.Closed }})" else "Active Queue",
                        "LOS_URGENT" to if (isBengali) "🚨 রেড এলওএস / জরুরি" else "🚨 Red LOS / Urgent",
                        "IN_PROGRESS" to if (isBengali) "কাজ চলছে (${tickets.count { it.status == TicketStatus.In_Progress }})" else "In Progress",
                        "RESOLVED" to if (isBengali) "সমাধানকৃত (${tickets.count { it.status == TicketStatus.Resolved }})" else "Resolved"
                    )

                    items(filterChips) { (key, label) ->
                        FilterChip(
                            selected = selectedFilter == key,
                            onClick = { selectedFilter = key },
                            label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                            colors = FilterChipDefaults.filterChipColors(
                                containerColor = SurfaceDark,
                                selectedContainerColor = EmeraldSuccess,
                                labelColor = TextSecondary,
                                selectedLabelColor = Color.Black
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                borderColor = CardBorderColor,
                                selectedBorderColor = EmeraldSuccess,
                                enabled = true,
                                selected = selectedFilter == key
                            )
                        )
                    }
                }
            }
        }

        // Ticket Items
        if (activeTickets.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 30.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (isBengali) "এই ক্যাটাগরিতে কোন টিকেট নেই" else "No tickets in this queue",
                        color = TextSecondary,
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            items(activeTickets, key = { it.id }) { ticket ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectTicket(ticket) }
                        .testTag("noc_ticket_${ticket.id}"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, if (ticket.priority == TicketPriority.Urgent) RoseError.copy(alpha = 0.6f) else EmeraldSuccess.copy(alpha = 0.3f))))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
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

                        Text(
                            text = ticket.title,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        Text(
                            text = ticket.category,
                            fontSize = 11.sp,
                            color = CyanAccent
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "গ্রাহক: ${ticket.clientName} • ${ticket.clientAddress}",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Indicators & Actions
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
                                // Work Order button
                                OutlinedButton(
                                    onClick = { onOpenWorkOrder(ticket) },
                                    modifier = Modifier.height(30.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp),
                                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.linearGradient(listOf(CyanAccent, CyanAccent)))
                                ) {
                                    Icon(Icons.Default.QrCode, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(13.dp))
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(if (isBengali) "ওয়ার্ক অর্ডার" else "Work Order", fontSize = 10.sp, color = CyanAccent, fontWeight = FontWeight.Bold)
                                }

                                // In Progress quick action
                                if (ticket.status != TicketStatus.Resolved) {
                                    FilledTonalButton(
                                        onClick = {
                                            if (ticket.status == TicketStatus.In_Progress) {
                                                onUpdateStatus(ticket.id, TicketStatus.Resolved)
                                            } else {
                                                onUpdateStatus(ticket.id, TicketStatus.In_Progress)
                                            }
                                        },
                                        modifier = Modifier.height(30.dp),
                                        contentPadding = PaddingValues(horizontal = 8.dp),
                                        colors = ButtonDefaults.filledTonalButtonColors(
                                            containerColor = if (ticket.status == TicketStatus.In_Progress) EmeraldSuccess else IndigoPrimary,
                                            contentColor = Color.White
                                        )
                                    ) {
                                        Text(
                                            text = if (ticket.status == TicketStatus.In_Progress) (if (isBengali) "সমাধান করুন" else "Resolve") else (if (isBengali) "কাজ শুরু" else "Start"),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
