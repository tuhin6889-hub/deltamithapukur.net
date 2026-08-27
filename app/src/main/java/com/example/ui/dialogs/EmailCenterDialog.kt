package com.example.ui.dialogs

import androidx.compose.foundation.background
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
import com.example.ui.theme.*

@Composable
fun EmailCenterDialog(
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onSendEmailAlert: (channel: String, recipient: String, message: String) -> Unit
) {
    var recipientEmail by remember { mutableStateOf("client@deltamithapukur.com") }
    var emailSubject by remember { mutableStateOf("[Delta Mithapukur ISP] Support Ticket Update Notification") }
    var emailBody by remember { mutableStateOf("Dear Subscriber, Your support ticket has been prioritized by NOC engineering. Optical fiber diagnostics in progress.") }
    var sendStatusMsg by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.9f)
                .testTag("email_center_dialog"),
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Email, contentDescription = null, tint = IndigoLight, modifier = Modifier.size(22.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Email Dispatcher & SMTP Gateway",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "smtp.deltamithapukur.com:587 • Connected",
                                fontSize = 10.sp,
                                color = IndigoLight,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
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
                    // SMTP Status
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1B4B))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("📨 Inbound & Outbound SMTP Active", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = IndigoLight)
                                Text("support@deltamithapukur.com • TLS 1.3 Encryption", fontSize = 10.sp, color = TextSecondary)
                            }
                        }
                    }

                    // Recipient
                    item {
                        Text("প্রাপকের ইমেইল (Recipient Email):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = recipientEmail,
                            onValueChange = { recipientEmail = it },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    // Subject
                    item {
                        Text("ইমেইল বিষয় (Subject):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = emailSubject,
                            onValueChange = { emailSubject = it },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    // Body
                    item {
                        Text("বার্তা বিবরণ (HTML Email Body):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = emailBody,
                            onValueChange = { emailBody = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    if (sendStatusMsg != null) {
                        item {
                            Surface(
                                color = Color(0xFF064E3B),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = sendStatusMsg!!,
                                    fontSize = 11.sp,
                                    color = EmeraldSuccess,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        }
                    }
                }

                // Send Button
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = SurfaceVariantDark
                ) {
                    Button(
                        onClick = {
                            onSendEmailAlert("Email", recipientEmail, "$emailSubject: $emailBody")
                            sendStatusMsg = "✅ ইমেইল সফলভাবে $recipientEmail ঠিকানায় পাঠানো হয়েছে!"
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp)
                            .testTag("btn_send_email_dispatch"),
                        colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("অফিসিয়াল ইমেইল পাঠান", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
