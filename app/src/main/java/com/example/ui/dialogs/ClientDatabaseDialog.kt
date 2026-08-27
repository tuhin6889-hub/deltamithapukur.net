package com.example.ui.dialogs

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.ClientInfo
import com.example.ui.theme.*

@Composable
fun ClientDatabaseDialog(
    clients: List<ClientInfo>,
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onOpenNewClient: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }

    val filtered = remember(clients, searchQuery) {
        if (searchQuery.isBlank()) clients
        else clients.filter {
            it.name.contains(searchQuery, ignoreCase = true) ||
            it.cid.contains(searchQuery, ignoreCase = true) ||
            it.phone.contains(searchQuery, ignoreCase = true) ||
            it.area.contains(searchQuery, ignoreCase = true)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .testTag("client_db_dialog"),
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
                    Column {
                        Text(
                            text = if (isBengali) "গ্রাহক ডাটাবেজ (Subscriber Directory)" else "Subscriber Directory",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "মোট সক্রিয় গ্রাহক: ${clients.size}",
                            fontSize = 11.sp,
                            color = CyanAccent
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onOpenNewClient, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.PersonAdd, contentDescription = "Add", tint = CyanAccent)
                        }
                        IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                        }
                    }
                }

                // Search Bar
                Box(modifier = Modifier.padding(12.dp)) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("গ্রাহকের নাম, CID বা ফোন নম্বর দিয়ে খুঁজুন...", fontSize = 12.sp, color = TextMuted) },
                        modifier = Modifier.fillMaxWidth(),
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(18.dp)) },
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp)
                    )
                }

                // Clients List
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 16.dp)
                ) {
                    items(filtered, key = { it.cid }) { client ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(client.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Surface(color = Color(0xFF0F172A), shape = RoundedCornerShape(4.dp)) {
                                            Text(client.cid, fontSize = 10.sp, color = CyanAccent, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                        }
                                    }
                                    Surface(
                                        color = if (client.status == "Active") Color(0xFF064E3B) else Color(0xFF4C0519),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(client.status, fontSize = 9.sp, color = if (client.status == "Active") EmeraldSuccess else RoseError, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))
                                Text("📞 ${client.phone} • ✉️ ${client.email}", fontSize = 11.sp, color = TextSecondary)
                                Text("📍 ${client.address} (${client.area})", fontSize = 11.sp, color = TextMuted)

                                Spacer(modifier = Modifier.height(6.dp))
                                HorizontalDivider(color = CardBorderColor)
                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("⚡ ${client.packageName}", fontSize = 10.sp, color = IndigoLight, fontWeight = FontWeight.Bold)
                                    Text("IP: ${client.ipAddress}", fontSize = 10.sp, color = TextSecondary)
                                    Text("Rx: ${client.opticalPower}", fontSize = 10.sp, color = EmeraldSuccess, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
