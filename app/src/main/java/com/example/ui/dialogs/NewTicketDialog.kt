package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.*
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewTicketDialog(
    clients: List<ClientInfo>,
    defaultCid: String?,
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (cid: String, clientName: String, phone: String, address: String, area: String, packageSpeed: String, category: String, title: String, description: String, priority: TicketPriority, opticalPower: String, pingMs: Int) -> Unit
) {
    var selectedClient by remember {
        mutableStateOf(clients.find { it.cid == defaultCid } ?: clients.firstOrNull() ?: ClientInfo("CID-1001", "গ্রাহক", "01700-000000", "test@delta.com", "মিঠাপুকুর", "মিঠাপুকুর সদর", "20 Mbps", "103.145.22.10", "00:11:22", "-21.5 dBm"))
    }
    var category by remember { mutableStateOf(TICKET_CATEGORIES.first()) }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(TicketPriority.High) }
    var opticalPower by remember { mutableStateOf(selectedClient.opticalPower) }
    var pingMs by remember { mutableIntStateOf(28) }

    var showClientDropdown by remember { mutableStateOf(false) }
    var showCategoryDropdown by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.9f)
                .testTag("new_ticket_dialog"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceVariantDark)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isBengali) "নতুন সাপোর্ট টিকেট দাখিল" else "Create Support Ticket",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Client Selector
                    item {
                        Text("গ্রাহক নির্বাচন (Subscriber CID):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showClientDropdown = true }
                                .testTag("select_client_trigger"),
                            shape = RoundedCornerShape(10.dp),
                            color = SurfaceVariantDark
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(selectedClient.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                    Text("${selectedClient.cid} • ${selectedClient.packageName} • ${selectedClient.area}", fontSize = 11.sp, color = CyanAccent)
                                }
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = TextSecondary)
                            }
                        }
                    }

                    // Category Selector
                    item {
                        Text("সমস্যার ক্যাটাগরি (Category):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showCategoryDropdown = true }
                                .testTag("select_category_trigger"),
                            shape = RoundedCornerShape(10.dp),
                            color = SurfaceVariantDark
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(category, fontWeight = FontWeight.Medium, fontSize = 12.sp, color = TextPrimary)
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = TextSecondary)
                            }
                        }
                    }

                    // Priority Selector
                    item {
                        Text("অগ্রাধিকার মাত্রা (Priority):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            TicketPriority.values().forEach { prio ->
                                FilterChip(
                                    selected = priority == prio,
                                    onClick = { priority = prio },
                                    label = { Text(prio.label, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        containerColor = SurfaceVariantDark,
                                        selectedContainerColor = when (prio) {
                                            TicketPriority.Urgent -> RoseError
                                            TicketPriority.High -> AmberWarning
                                            TicketPriority.Medium -> CyanAccent
                                            TicketPriority.Low -> SlateDark
                                        },
                                        labelColor = TextSecondary,
                                        selectedLabelColor = Color.Black
                                    )
                                )
                            }
                        }
                    }

                    // Problem Title
                    item {
                        Text("সমস্যার শিরোনাম (Title):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = title,
                            onValueChange = { title = it },
                            placeholder = { Text("e.g. রাউটারে রেড এলওএস আলো জ্বলছে, নেট নেই", fontSize = 12.sp, color = TextMuted) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("input_ticket_title"),
                            shape = RoundedCornerShape(10.dp),
                            singleLine = true
                        )
                    }

                    // Problem Description
                    item {
                        Text("বিস্তারিত বিবরণ (Description):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            placeholder = { Text("কখন থেকে সমস্যা শুরু হয়েছে এবং কোন ডিভাইস বা তারে সমস্যা হচ্ছে লিখুন...", fontSize = 12.sp, color = TextMuted) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(110.dp)
                                .testTag("input_ticket_desc"),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }

                    // Optical Signal input
                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Optical Signal (dBm)", fontSize = 11.sp, color = TextSecondary)
                                OutlinedTextField(
                                    value = opticalPower,
                                    onValueChange = { opticalPower = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    shape = RoundedCornerShape(8.dp)
                                )
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Ping Latency (ms)", fontSize = 11.sp, color = TextSecondary)
                                OutlinedTextField(
                                    value = pingMs.toString(),
                                    onValueChange = { pingMs = it.toIntOrNull() ?: 24 },
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    shape = RoundedCornerShape(8.dp)
                                )
                            }
                        }
                    }
                }

                // Action Footer
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = SurfaceVariantDark
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = onDismiss,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("বাতিল", color = TextSecondary)
                        }

                        Button(
                            onClick = {
                                if (title.isBlank()) {
                                    title = category
                                }
                                onSubmit(
                                    selectedClient.cid,
                                    selectedClient.name,
                                    selectedClient.phone,
                                    selectedClient.address,
                                    selectedClient.area,
                                    selectedClient.packageName,
                                    category,
                                    title,
                                    if (description.isBlank()) "গ্রাহক কর্তৃক নতুন টিকেট দাখিল করা হয়েছে।" else description,
                                    priority,
                                    opticalPower,
                                    pingMs
                                )
                            },
                            modifier = Modifier
                                .weight(1.5f)
                                .testTag("btn_submit_new_ticket"),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("টিকেট তৈরি করুন", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    // Client Selector Dialog
    if (showClientDropdown) {
        AlertDialog(
            onDismissRequest = { showClientDropdown = false },
            containerColor = SurfaceDark,
            title = { Text("গ্রাহক নির্বাচন করুন", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(clients) { c ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    selectedClient = c
                                    opticalPower = c.opticalPower
                                    showClientDropdown = false
                                },
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceVariantDark
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(c.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                Text("${c.cid} • ${c.packageName} • ${c.area}", fontSize = 11.sp, color = CyanAccent)
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showClientDropdown = false }) { Text("বাতিল", color = TextSecondary) } }
        )
    }

    // Category Selector Dialog
    if (showCategoryDropdown) {
        AlertDialog(
            onDismissRequest = { showCategoryDropdown = false },
            containerColor = SurfaceDark,
            title = { Text("সমস্যার ক্যাটাগরি নির্বাচন করুন", color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold) },
            text = {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(TICKET_CATEGORIES) { cat ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    category = cat
                                    showCategoryDropdown = false
                                },
                            shape = RoundedCornerShape(8.dp),
                            color = SurfaceVariantDark
                        ) {
                            Text(text = cat, modifier = Modifier.padding(10.dp), fontSize = 12.sp, color = TextPrimary)
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showCategoryDropdown = false }) { Text("বাতিল", color = TextSecondary) } }
        )
    }
}

val SlateDark = Color(0xFF334155)
