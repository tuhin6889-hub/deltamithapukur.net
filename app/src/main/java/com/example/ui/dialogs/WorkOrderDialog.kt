package com.example.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.model.Ticket
import com.example.ui.components.TicketPriorityBadge
import com.example.ui.components.TicketStatusBadge
import com.example.ui.theme.*

@Composable
fun WorkOrderDialog(
    ticket: Ticket,
    isBengali: Boolean,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .testTag("work_order_dialog"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CyanAccent, EmeraldSuccess)))
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Top Action Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceVariantDark)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Print, contentDescription = null, tint = CyanAccent, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "ডিজিটাল ফিল্ড ওয়ার্ক অর্ডার (Field Dispatch)",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                // Printable Styled Card Body
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Document Header
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "DELTA MITHAPUKUR ISP",
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 16.sp,
                                            color = Color.Black
                                        )
                                        Text(
                                            text = "Optical Fiber Maintenance & Splicing Dispatch",
                                            fontSize = 10.sp,
                                            color = Color.DarkGray
                                        )
                                    }

                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = "WO-#${ticket.id.takeLast(4)}",
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 14.sp,
                                            color = Color(0xFF4338CA),
                                            fontFamily = FontFamily.Monospace
                                        )
                                        Text(
                                            text = ticket.createdDate,
                                            fontSize = 10.sp,
                                            color = Color.Gray
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))
                                HorizontalDivider(color = Color.LightGray)
                                Spacer(modifier = Modifier.height(10.dp))

                                // Client Info block
                                Text("গ্রাহকের তথ্য (Subscriber Coordinates):", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                Text("নাম: ${ticket.clientName} (${ticket.cid})", fontSize = 12.sp, color = Color.Black, fontWeight = FontWeight.SemiBold)
                                Text("মোবাইল: ${ticket.clientPhone}", fontSize = 11.sp, color = Color.DarkGray)
                                Text("ঠিকানা: ${ticket.clientAddress}", fontSize = 11.sp, color = Color.DarkGray)
                                Text("এলাকা: ${ticket.area} • প্যাকেজ: ${ticket.packageSpeed}", fontSize = 11.sp, color = Color(0xFF0284C7), fontWeight = FontWeight.Bold)

                                Spacer(modifier = Modifier.height(10.dp))
                                HorizontalDivider(color = Color.LightGray)
                                Spacer(modifier = Modifier.height(10.dp))

                                // Fault block
                                Text("সমস্যার বিবরণ (Fault Description):", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                Text("ক্যাটাগরি: ${ticket.category}", fontSize = 12.sp, color = Color(0xFFDC2626), fontWeight = FontWeight.Bold)
                                Text("শিরোনাম: ${ticket.title}", fontSize = 12.sp, color = Color.Black, fontWeight = FontWeight.Medium)
                                Text("বিবরণ: ${ticket.description}", fontSize = 11.sp, color = Color.DarkGray)

                                Spacer(modifier = Modifier.height(10.dp))

                                // Signal metrics
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFFF1F5F9), RoundedCornerShape(8.dp))
                                        .padding(10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Rx Power: ${ticket.opticalPower}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                    Text("Ping: ${ticket.pingMs}ms", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                    Text("Priority: ${ticket.priority.name}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB91C1C))
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                // Field Engineer Checklist
                                Text("ফিল্ড টেকনিশিয়ান চেকলিস্ট:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                                val checklist = listOf(
                                    "1. TJ Box অপটিক্যাল পাওয়ার মিটার পরিমাপ সম্পন্ন",
                                    "2. ড্রপ ক্যাবল বা ফাইবার কোর ফিউশন স্প্লাইসিং",
                                    "3. ONU অপটিক্যাল রিসিভ সিগন্যাল (-19 to -23 dBm) যাচাই",
                                    "4. ক্লায়েন্ট মোবাইল বা পিসিতে স্পিডটেস্ট ও ইউটিউব ব্রাউজিং চেক",
                                    "5. গ্রাহকের ডিজিটাল স্বাক্ষর বা সম্মতি গ্রহণ"
                                )
                                checklist.forEach { item ->
                                    Text("☐ $item", fontSize = 10.sp, color = Color.DarkGray, modifier = Modifier.padding(vertical = 2.dp))
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Sign-off area
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text("________________________", color = Color.Gray, fontSize = 10.sp)
                                        Text("ফিল্ড ইঞ্জিনিয়ার স্বাক্ষর", fontSize = 10.sp, color = Color.DarkGray)
                                    }
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text("________________________", color = Color.Gray, fontSize = 10.sp)
                                        Text("গ্রাহকের স্বাক্ষর ও সন্তুষ্টি", fontSize = 10.sp, color = Color.DarkGray)
                                    }
                                }
                            }
                        }
                    }
                }

                // Footer Actions
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
                            Text("বন্ধ করুন", color = TextSecondary)
                        }

                        Button(
                            onClick = onDismiss,
                            modifier = Modifier.weight(1.5f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = Color.Black)
                        ) {
                            Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("প্রিন্ট / ফিল্ডে শেয়ার", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
