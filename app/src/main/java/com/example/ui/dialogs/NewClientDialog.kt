package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PersonAdd
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
fun NewClientDialog(
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (ClientInfo) -> Unit
) {
    var cid by remember { mutableStateOf("CID-${(1000..9999).random()}") }
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var area by remember { mutableStateOf("মিঠাপুকুর সদর (Mithapukur Sadar)") }
    var packageName by remember { mutableStateOf("20 Mbps Fiber Freedom") }
    var ipAddress by remember { mutableStateOf("103.145.22.${(10..250).random()}") }
    var onuMac by remember { mutableStateOf("44:D4:54:${(10..99).random()}:${(10..99).random()}:B9") }
    var opticalPower by remember { mutableStateOf("-21.4 dBm (Optimal)") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.9f)
                .testTag("new_client_dialog"),
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
                        text = if (isBengali) "নতুন গ্রাহক নিবন্ধন (New Subscriber)" else "Register New Subscriber",
                        fontSize = 15.sp,
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
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        OutlinedTextField(
                            value = cid,
                            onValueChange = { cid = it },
                            label = { Text("Client CID") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("গ্রাহকের নাম (Full Name)") },
                            modifier = Modifier.fillMaxWidth().testTag("input_client_name"),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("মোবাইল নম্বর (Phone / WhatsApp)") },
                            modifier = Modifier.fillMaxWidth().testTag("input_client_phone"),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("ইমেইল এড্রেস (Email Address)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = address,
                            onValueChange = { address = it },
                            label = { Text("পূর্ণাঙ্গ ঠিকানা (Address)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = area,
                            onValueChange = { area = it },
                            label = { Text("জোন / এলাকা (Area)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = packageName,
                            onValueChange = { packageName = it },
                            label = { Text("প্যাকেজ স্পিড (Package Speed)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = ipAddress,
                                onValueChange = { ipAddress = it },
                                label = { Text("Static IP") },
                                modifier = Modifier.weight(1f),
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp)
                            )
                            OutlinedTextField(
                                value = opticalPower,
                                onValueChange = { opticalPower = it },
                                label = { Text("Rx Signal") },
                                modifier = Modifier.weight(1f),
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }

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
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("বাতিল", color = TextSecondary)
                        }

                        Button(
                            onClick = {
                                if (name.isNotBlank()) {
                                    val newClient = ClientInfo(
                                        cid = cid.trim(),
                                        name = name.trim(),
                                        phone = if (phone.isBlank()) "01700-000000" else phone.trim(),
                                        email = if (email.isBlank()) "client@deltamithapukur.com" else email.trim(),
                                        address = if (address.isBlank()) "মিঠাপুকুর সদর" else address.trim(),
                                        area = area.trim(),
                                        packageName = packageName.trim(),
                                        ipAddress = ipAddress.trim(),
                                        onuMac = onuMac.trim(),
                                        opticalPower = opticalPower.trim(),
                                        balance = 0.0,
                                        status = "Active"
                                    )
                                    onSubmit(newClient)
                                }
                            },
                            modifier = Modifier.weight(1.5f).testTag("btn_submit_client"),
                            colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = Color.Black),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("নিবন্ধন সম্পন্ন করুন", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
