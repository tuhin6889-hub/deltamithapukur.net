package com.example.ui.dialogs

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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.*
import com.example.ui.components.*
import com.example.ui.theme.*

@Composable
fun TicketDetailDialog(
    ticket: Ticket,
    currentRole: UserRole,
    staffList: List<NocStaff>,
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onAddComment: (String, String, String) -> Unit,
    onUpdateStatus: (TicketStatus) -> Unit,
    onAssignNoc: (String) -> Unit,
    onTriggerAiDiagnosis: () -> Unit,
    isAiLoading: Boolean,
    onSubmitFeedback: (Int, String) -> Unit,
    onSendNotification: (String, String, String) -> Unit
) {
    var newCommentText by remember { mutableStateOf("") }
    var selectedRating by remember { mutableIntStateOf(ticket.rating ?: 5) }
    var feedbackText by remember { mutableStateOf(ticket.feedback ?: "") }
    var showAssignMenu by remember { mutableStateOf(false) }
    var showStatusMenu by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .testTag("ticket_detail_dialog"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, IndigoPrimary.copy(alpha = 0.4f))))
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceVariantDark)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "টিকেট #${ticket.id}",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            TicketPriorityBadge(priority = ticket.priority, isBengali = isBengali)
                        }
                        Text(
                            text = "${ticket.cid} • ${ticket.clientName}",
                            fontSize = 11.sp,
                            color = CyanAccent
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TicketStatusBadge(status = ticket.status, isBengali = isBengali)
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                        }
                    }
                }

                // Scrollable Content Body
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Category & Problem Description
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = ticket.title,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "ক্যাটাগরি: ${ticket.category}",
                                    fontSize = 11.sp,
                                    color = CyanAccent,
                                    fontWeight = FontWeight.Medium
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = ticket.description,
                                    fontSize = 12.sp,
                                    color = TextPrimary,
                                    lineHeight = 18.sp
                                )

                                Spacer(modifier = Modifier.height(10.dp))
                                HorizontalDivider(color = CardBorderColor)
                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        OpticalSignalIndicator(power = ticket.opticalPower)
                                        PingLatencyIndicator(pingMs = ticket.pingMs)
                                    }
                                    Text(
                                        text = "স্থান: ${ticket.area}",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                        }
                    }

                    // Assigned Staff & Quick Actions (For Manager / NOC)
                    if (currentRole == UserRole.MANAGER || currentRole == UserRole.NOC) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                            ) {
                                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column {
                                            Text("দায়িত্বপ্রাপ্ত নোক ইঞ্জিনিয়ার:", fontSize = 11.sp, color = TextSecondary)
                                            Text(
                                                text = ticket.assignedNoc ?: "এখনও কাউকে অ্যাসাইন করা হয়নি",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (ticket.assignedNoc != null) CyanAccent else AmberWarning
                                            )
                                        }

                                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                            Button(
                                                onClick = { showAssignMenu = true },
                                                colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                                shape = RoundedCornerShape(8.dp)
                                            ) {
                                                Icon(Icons.Default.PersonSearch, contentDescription = null, modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(if (isBengali) "অ্যাসাইন" else "Assign", fontSize = 11.sp)
                                            }

                                            Button(
                                                onClick = { showStatusMenu = true },
                                                colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = Color.Black),
                                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                                shape = RoundedCornerShape(8.dp)
                                            ) {
                                                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(if (isBengali) "স্ট্যাটাস" else "Status", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }

                                    // Quick notification dispatch buttons
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = {
                                                onSendNotification(
                                                    "WhatsApp",
                                                    ticket.clientName,
                                                    "প্রিয় ${ticket.clientName}, আপনার টিকেট #${ticket.id} (${ticket.category}) নোক টিম কর্তৃক পর্যালোচনা করা হচ্ছে।"
                                                )
                                            },
                                            modifier = Modifier.weight(1f),
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.outlinedButtonColors(contentColor = EmeraldSuccess)
                                        ) {
                                            Icon(Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("WhatsApp Alert", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        }

                                        OutlinedButton(
                                            onClick = {
                                                onSendNotification(
                                                    "Email",
                                                    ticket.clientName,
                                                    "Support Ticket Update for #${ticket.id} - NOC engineers dispatched to ${ticket.area}."
                                                )
                                            },
                                            modifier = Modifier.weight(1f),
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.outlinedButtonColors(contentColor = IndigoLight)
                                        ) {
                                            Icon(Icons.Default.Email, contentDescription = null, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Email Dispatch", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // AI NOC Diagnostics Section
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF161528)),
                            border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(IndigoPrimary, CyanAccent)))
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Psychology, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(20.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = if (isBengali) "AI নোক রুট-কজ ডায়াগনস্টিক" else "AI NOC Root Cause Diagnosis",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }

                                    Button(
                                        onClick = onTriggerAiDiagnosis,
                                        enabled = !isAiLoading,
                                        colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.testTag("btn_trigger_ai_diagnosis")
                                    ) {
                                        if (isAiLoading) {
                                            CircularProgressIndicator(modifier = Modifier.size(14.dp), color = Color.White, strokeWidth = 2.dp)
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("বিশ্লেষণ চলছে...", fontSize = 11.sp)
                                        } else {
                                            Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(if (ticket.aiDiagnosis == null) "AI এনালাইসিস চালান" else "রি-এনালাইসিস", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }

                                if (ticket.aiDiagnosis != null) {
                                    Spacer(modifier = Modifier.height(10.dp))
                                    HorizontalDivider(color = CardBorderColor)
                                    Spacer(modifier = Modifier.height(10.dp))

                                    Text(
                                        text = "🔍 সমস্যা বিশ্লেষণ:",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = CyanAccent
                                    )
                                    Text(
                                        text = ticket.aiDiagnosis.summaryBengali,
                                        fontSize = 12.sp,
                                        color = TextPrimary,
                                        lineHeight = 17.sp
                                    )

                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "🛠️ নোক ফিল্ড স্টেপস:",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = EmeraldSuccess
                                    )
                                    ticket.aiDiagnosis.nocSteps.forEach { step ->
                                        Text(text = "• $step", fontSize = 11.sp, color = TextSecondary, modifier = Modifier.padding(vertical = 1.dp))
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "💬 গ্রাহকের জন্য ড্রাফট বার্তা:",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = IndigoLight
                                    )
                                    Surface(
                                        color = SurfaceDark,
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text(
                                            text = ticket.aiDiagnosis.clientReplyBengali,
                                            fontSize = 11.sp,
                                            color = TextPrimary,
                                            modifier = Modifier.padding(8.dp),
                                            lineHeight = 16.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Comments Timeline Section
                    item {
                        Text(
                            text = "💬 আলোচনা ও আপডেট টাইমলাইন (${ticket.comments.size})",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }

                    items(ticket.comments) { comment ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = when (comment.role) {
                                    "Manager" -> Color(0xFF1E1B4B)
                                    "NOC" -> Color(0xFF082F49)
                                    "Client" -> Color(0xFF064E3B)
                                    else -> SurfaceVariantDark
                                }
                            )
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = comment.author,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            color = Color.White
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(
                                            color = Color.Black.copy(alpha = 0.3f),
                                            shape = RoundedCornerShape(4.dp)
                                        ) {
                                            Text(
                                                text = comment.role,
                                                fontSize = 9.sp,
                                                color = CyanAccent,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }
                                    Text(text = comment.timestamp, fontSize = 10.sp, color = TextMuted)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = comment.text,
                                    fontSize = 12.sp,
                                    color = TextPrimary,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }

                    // Rating & Feedback for Client if Resolved
                    if (ticket.status == TicketStatus.Resolved || ticket.status == TicketStatus.Closed) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text(
                                        text = "⭐ সার্ভিস রেটিং ও মতামত:",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = AmberWarning
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))

                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        for (i in 1..5) {
                                            IconButton(
                                                onClick = { selectedRating = i },
                                                modifier = Modifier.size(32.dp)
                                            ) {
                                                Icon(
                                                    imageVector = if (i <= selectedRating) Icons.Default.Star else Icons.Default.StarBorder,
                                                    contentDescription = "$i Stars",
                                                    tint = if (i <= selectedRating) AmberWarning else TextMuted
                                                )
                                            }
                                        }
                                    }

                                    if (ticket.rating == null) {
                                        OutlinedTextField(
                                            value = feedbackText,
                                            onValueChange = { feedbackText = it },
                                            placeholder = { Text("আপনার মূল্যবান মন্তব্য লিখুন...", fontSize = 11.sp, color = TextMuted) },
                                            modifier = Modifier.fillMaxWidth(),
                                            singleLine = true,
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Button(
                                            onClick = { onSubmitFeedback(selectedRating, feedbackText) },
                                            colors = ButtonDefaults.buttonColors(containerColor = AmberWarning, contentColor = Color.Black),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.align(Alignment.End)
                                        ) {
                                            Text("রেটিং জমা দিন", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                        }
                                    } else {
                                        Text(text = "মতামত: ${ticket.feedback ?: "খুব ভালো সার্ভিস"}", fontSize = 11.sp, color = TextSecondary)
                                    }
                                }
                            }
                        }
                    }
                }

                // Add Comment Input Footer
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceVariantDark)
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = newCommentText,
                        onValueChange = { newCommentText = it },
                        placeholder = { Text("নতুন বার্তা বা আপডেট লিখুন...", fontSize = 12.sp, color = TextMuted) },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("input_ticket_comment"),
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            if (newCommentText.isNotBlank()) {
                                val author = when (currentRole) {
                                    UserRole.MANAGER -> "ব্রাঞ্চ ম্যানেজার"
                                    UserRole.NOC -> "নোক সাপোর্ট"
                                    UserRole.CLIENT -> ticket.clientName
                                }
                                val roleStr = when (currentRole) {
                                    UserRole.MANAGER -> "Manager"
                                    UserRole.NOC -> "NOC"
                                    UserRole.CLIENT -> "Client"
                                }
                                onAddComment(author, roleStr, newCommentText.trim())
                                newCommentText = ""
                            }
                        },
                        modifier = Modifier
                            .background(IndigoPrimary, CircleShape)
                            .testTag("btn_send_comment")
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }

    // Assign Dialog
    if (showAssignMenu) {
        AlertDialog(
            onDismissRequest = { showAssignMenu = false },
            containerColor = SurfaceDark,
            title = { Text("ফিল্ড টেকনিশিয়ান নির্বাচন করুন", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(staffList) { staff ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onAssignNoc("${staff.id} (${staff.name})")
                                    showAssignMenu = false
                                },
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceVariantDark
                        ) {
                            Row(modifier = Modifier.padding(10.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Column {
                                    Text(staff.name, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
                                    Text("${staff.id} • ${staff.area}", fontSize = 10.sp, color = TextSecondary)
                                }
                                Text(staff.status, fontSize = 10.sp, color = if (staff.status == "On Field") RoseError else EmeraldSuccess)
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showAssignMenu = false }) { Text("বাতিল", color = TextSecondary) } }
        )
    }

    // Status Dialog
    if (showStatusMenu) {
        AlertDialog(
            onDismissRequest = { showStatusMenu = false },
            containerColor = SurfaceDark,
            title = { Text("টিকেট স্ট্যাটাস নির্বাচন করুন", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    TicketStatus.values().forEach { st ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onUpdateStatus(st)
                                    showStatusMenu = false
                                },
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceVariantDark
                        ) {
                            Row(modifier = Modifier.padding(10.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text(st.labelBn, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                TicketStatusBadge(status = st, isBengali = isBengali)
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showStatusMenu = false }) { Text("বাতিল", color = TextSecondary) } }
        )
    }
}
