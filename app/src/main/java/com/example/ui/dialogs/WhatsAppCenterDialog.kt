package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.ui.theme.*

@Composable
fun WhatsAppCenterDialog(
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onSendBroadcast: (channel: String, recipient: String, message: String) -> Unit
) {
    var recipientPhone by remember { mutableStateOf("01700-111222") }
    var selectedTemplate by remember { mutableStateOf("TICKET_STATUS_ALERT") }
    var customMessage by remember { mutableStateOf("প্রিয় গ্রাহক, আপনার অপটিক্যাল ফাইবার লাইনের সমস্যা দ্রুত সমাধানের জন্য নোক টিম মাঠে নিয়োজিত হয়েছে।") }
    var sendSuccessMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.9f)
                .testTag("whatsapp_center_dialog"),
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
                        Icon(Icons.Default.Chat, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(22.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "WhatsApp Business Cloud API",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Meta Cloud API v19.0 • Connected",
                                fontSize = 10.sp,
                                color = EmeraldSuccess,
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
                    // API Status Box
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF064E3B).copy(alpha = 0.4f))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("🟢 WhatsApp Gateway Online", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = EmeraldSuccess)
                                Text("WABA ID: WABA-8801700998877 • Webhook: Active", fontSize = 10.sp, color = TextSecondary)
                            }
                        }
                    }

                    // Recipient Number
                    item {
                        Text("প্রাপকের ফোন নম্বর (Recipient Phone):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = recipientPhone,
                            onValueChange = { recipientPhone = it },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    // Template Selector
                    item {
                        Text("HSM মেসেজ টেমপ্লেট নির্বাচন:", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            val templates = listOf(
                                "TICKET_STATUS_ALERT" to "🚨 টিকেট স্ট্যাটাস ও নোক আপডেট",
                                "SPLICING_TEAM_DISPATCH" to "🛠️ স্প্লাইসিং টিম ডিসপ্যাচ নোটিশ",
                                "PAYMENT_CONFIRMATION" to "💳 বিকাশ বিল পরিশোধ ও রিসিট",
                                "GENERAL_MAINTENANCE" to "📡 জোনাল ফাইবার রক্ষণাবেক্ষণ নোটিশ"
                            )

                            templates.forEach { (key, label) ->
                                Surface(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            selectedTemplate = key
                                            customMessage = when (key) {
                                                "TICKET_STATUS_ALERT" -> "প্রিয় গ্রাহক, আপনার অপটিক্যাল ফাইবার লাইনের সমস্যা দ্রুত সমাধানের জন্য নোক টিম মাঠে নিয়োজিত হয়েছে।"
                                                "SPLICING_TEAM_DISPATCH" -> "প্রিয় গ্রাহক, ফাইবার তার জোড়া দেওয়ার জন্য মিঠাপুকুর স্প্লাইসিং স্কোয়াড আপনার লোকেশনে রওনা হয়েছে।"
                                                "PAYMENT_CONFIRMATION" -> "প্রিয় গ্রাহক, আপনার চলতি মাসের ব্রডব্যান্ড বিল সফলভাবে গৃহীত হয়েছে। ধন্যবাদ ডেল্টা মিঠাপুকুর এর সাথে থাকার জন্য!"
                                                else -> "জরুরি বিজ্ঞপ্তি: আজ রাত ১২টা থেকে ২টা পর্যন্ত মিঠাপুকুর মেইন পপ-এ ব্যাকবোন অপটিক্যাল রক্ষণাবেক্ষণ চলবে।"
                                            }
                                        },
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (selectedTemplate == key) IndigoPrimary.copy(alpha = 0.3f) else SurfaceVariantDark
                                ) {
                                    Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                        RadioButton(selected = selectedTemplate == key, onClick = null)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(label, fontSize = 11.sp, color = TextPrimary, fontWeight = FontWeight.Medium)
                                    }
                                }
                            }
                        }
                    }

                    // Message Preview Box
                    item {
                        Text("মেসেজ প্রিভিউ (Formatted Output):", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        OutlinedTextField(
                            value = customMessage,
                            onValueChange = { customMessage = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }

                    if (sendSuccessMessage != null) {
                        item {
                            Surface(
                                color = Color(0xFF064E3B),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = sendSuccessMessage!!,
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
                            onSendBroadcast("WhatsApp", recipientPhone, customMessage)
                            sendSuccessMessage = "✅ WhatsApp HSM মেসেজ সফলভাবে $recipientPhone এ পাঠানো হয়েছে!"
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp)
                            .testTag("btn_send_whatsapp_broadcast"),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess, contentColor = Color.Black),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("WhatsApp বার্তা পাঠান", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
