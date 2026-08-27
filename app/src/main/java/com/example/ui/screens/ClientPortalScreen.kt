package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
fun ClientPortalScreen(
    client: ClientInfo,
    tickets: List<Ticket>,
    isBengali: Boolean,
    onSelectTicket: (Ticket) -> Unit,
    onOpenNewTicketDialog: () -> Unit
) {
    val clientTickets = remember(tickets, client.cid) {
        tickets.filter { it.cid == client.cid }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepDarkBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 40.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Client Connection Profile Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CyanAccent.copy(alpha = 0.5f), IndigoPrimary.copy(alpha = 0.3f))))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(CyanAccent.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(22.dp))
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = client.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "গ্রাহক আইডি: ${client.cid}",
                                    fontSize = 12.sp,
                                    color = CyanAccent,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        Surface(
                            color = if (client.status == "Active") Color(0xFF064E3B) else Color(0xFF4C0519),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = if (client.status == "Active") "Active Line" else "Suspended",
                                fontSize = 10.sp,
                                color = if (client.status == "Active") EmeraldSuccess else RoseError,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = CardBorderColor)
                    Spacer(modifier = Modifier.height(12.dp))

                    // Connection stats row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("ইন্টারনেট প্যাকেজ", fontSize = 10.sp, color = TextSecondary)
                            Text(client.packageName, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                        }
                        Column {
                            Text("অপটিক্যাল সিগন্যাল", fontSize = 10.sp, color = TextSecondary)
                            Text(client.opticalPower, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("চলতি ব্যালেন্স", fontSize = 10.sp, color = TextSecondary)
                            Text("৳${client.balance.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = if (client.balance > 0) AmberWarning else EmeraldSuccess)
                        }
                    }
                }
            }
        }

        // Action: New Ticket Button
        item {
            Button(
                onClick = onOpenNewTicketDialog,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("btn_client_create_ticket"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary)
            ) {
                Icon(Icons.Default.ConfirmationNumber, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isBengali) "নতুন সাপোর্ট টিকেট দাখিল করুন" else "Open New Support Ticket",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        // Section: Client's Tickets
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isBengali) "📋 আপনার দাখিলকৃত টিকেট সমূহ" else "📋 Your Support Tickets",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "${clientTickets.size} টিকেট",
                    fontSize = 11.sp,
                    color = CyanAccent,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        if (clientTickets.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark)
                ) {
                    Column(
                        modifier = Modifier
                            .padding(24.dp)
                            .fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(40.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (isBengali) "আপনার কোন ওপেন টিকেট নেই। লাইন সচল আছে।" else "No active tickets. Your connection is running smoothly!",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        } else {
            items(clientTickets, key = { it.id }) { ticket ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSelectTicket(ticket) }
                        .testTag("client_ticket_${ticket.id}"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, CardBorderColor)))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = ticket.id,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 13.sp,
                                color = Color.White
                            )
                            TicketStatusBadge(status = ticket.status, isBengali = isBengali)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = ticket.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        Text(
                            text = ticket.category,
                            fontSize = 11.sp,
                            color = CyanAccent
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = ticket.description,
                            fontSize = 11.sp,
                            color = TextSecondary,
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "আপডেট: ${ticket.updatedDate}",
                                fontSize = 10.sp,
                                color = TextMuted
                            )

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.ChatBubbleOutline, contentDescription = null, tint = IndigoLight, modifier = Modifier.size(13.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${ticket.comments.size} মেসেজ",
                                    fontSize = 11.sp,
                                    color = IndigoLight,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
