package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.TicketPriority
import com.example.model.TicketStatus
import com.example.model.UserRole
import com.example.ui.theme.*

@Composable
fun TicketStatusBadge(
    status: TicketStatus,
    isBengali: Boolean = true,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (status) {
        TicketStatus.Open -> Color(0xFF3B2F0B) to Color(0xFFFBBF24)
        TicketStatus.NOC_Assigned -> Color(0xFF082F49) to Color(0xFF38BDF8)
        TicketStatus.In_Progress -> Color(0xFF1E1B4B) to Color(0xFF818CF8)
        TicketStatus.Resolved -> Color(0xFF064E3B) to Color(0xFF34D399)
        TicketStatus.Closed -> Color(0xFF1E293B) to Color(0xFF94A3B8)
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Text(
            text = if (isBengali) status.labelBn else status.label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun TicketPriorityBadge(
    priority: TicketPriority,
    isBengali: Boolean = true,
    modifier: Modifier = Modifier
) {
    val (bgColor, textColor) = when (priority) {
        TicketPriority.Urgent -> Color(0xFF4C0519) to Color(0xFFFB7185)
        TicketPriority.High -> Color(0xFF451A03) to Color(0xFFF97316)
        TicketPriority.Medium -> Color(0xFF0C4A6E) to Color(0xFF38BDF8)
        TicketPriority.Low -> Color(0xFF1E293B) to Color(0xFF94A3B8)
    }

    Surface(
        color = bgColor,
        shape = RoundedCornerShape(6.dp),
        modifier = modifier
    ) {
        Text(
            text = if (isBengali) priority.labelBn else priority.label,
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
        )
    }
}

@Composable
fun OpticalSignalIndicator(
    power: String,
    modifier: Modifier = Modifier
) {
    val isLoss = power.contains("LOS") || power.contains("-3") || power.contains("-28") || power.contains("-29")
    val isWarning = power.contains("-26") || power.contains("-27")
    val dotColor = if (isLoss) RoseError else if (isWarning) AmberWarning else EmeraldSuccess

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .background(SurfaceVariantDark, RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 3.dp)
    ) {
        Box(
            modifier = Modifier
                .size(7.dp)
                .background(dotColor, CircleShape)
        )
        Spacer(modifier = Modifier.width(5.dp))
        Text(
            text = power,
            color = TextPrimary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun PingLatencyIndicator(
    pingMs: Int,
    modifier: Modifier = Modifier
) {
    val (color, label) = when {
        pingMs == 0 -> RoseError to "Down"
        pingMs < 40 -> EmeraldSuccess to "${pingMs}ms"
        pingMs < 100 -> AmberWarning to "${pingMs}ms"
        else -> RoseError to "${pingMs}ms"
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
            .background(SurfaceVariantDark, RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 3.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Speed,
            contentDescription = "Ping",
            tint = color,
            modifier = Modifier.size(13.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    currentRole: UserRole?,
    activeUserName: String?,
    isBengali: Boolean,
    downloadCount: Int = 1428,
    onToggleLang: () -> Unit,
    onOpenNotifications: () -> Unit,
    onOpenWhatsAppCenter: () -> Unit,
    onOpenEmailCenter: () -> Unit,
    onOpenClientDb: () -> Unit,
    onOpenInstallModal: () -> Unit,
    onLogout: () -> Unit
) {
    TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DeepDarkBackground,
            titleContentColor = TextPrimary
        ),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(IndigoPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Sensors,
                        contentDescription = "Delta Logo",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "DELTA MITHAPUKUR",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        letterSpacing = 0.5.sp
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (isBengali) "সাপোর্ট ও নোক পোর্টাল" else "Support & NOC Desk",
                            fontSize = 10.sp,
                            color = CyanAccent,
                            fontWeight = FontWeight.Medium
                        )
                        if (currentRole != null) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = when (currentRole) {
                                    UserRole.MANAGER -> Color(0xFF312E81)
                                    UserRole.NOC -> Color(0xFF075985)
                                    UserRole.CLIENT -> Color(0xFF065F46)
                                },
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = currentRole.name,
                                    color = Color.White,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                )
                            }
                        }
                    }
                }
            }
        },
        actions = {
            // APK Download Modal Action Button with Live Downloads counter badge
            IconButton(
                onClick = onOpenInstallModal,
                modifier = Modifier.testTag("action_install_modal")
            ) {
                BadgedBox(
                    badge = {
                        Badge(
                            containerColor = EmeraldSuccess,
                            contentColor = Color.Black
                        ) {
                            Text(
                                text = "APK",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Android,
                        contentDescription = "Download APK",
                        tint = EmeraldSuccess,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            if (currentRole != null) {
                // Quick Action buttons
                if (currentRole == UserRole.MANAGER || currentRole == UserRole.NOC) {
                    IconButton(
                        onClick = onOpenClientDb,
                        modifier = Modifier.testTag("action_client_db")
                    ) {
                        Icon(
                            imageVector = Icons.Default.People,
                            contentDescription = "Client DB",
                            tint = TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconButton(
                        onClick = onOpenWhatsAppCenter,
                        modifier = Modifier.testTag("action_whatsapp_center")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Chat,
                            contentDescription = "WhatsApp API",
                            tint = EmeraldSuccess,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconButton(
                        onClick = onOpenEmailCenter,
                        modifier = Modifier.testTag("action_email_center")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Email,
                            contentDescription = "Email Alerts",
                            tint = IndigoLight,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                IconButton(
                    onClick = onOpenNotifications,
                    modifier = Modifier.testTag("action_notifications")
                ) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notifications Log",
                        tint = AmberWarning,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Lang toggle
                TextButton(
                    onClick = onToggleLang,
                    modifier = Modifier.testTag("toggle_lang_btn")
                ) {
                    Text(
                        text = if (isBengali) "বাং" else "EN",
                        color = CyanAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }

                // Logout
                IconButton(
                    onClick = onLogout,
                    modifier = Modifier.testTag("logout_button")
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                        contentDescription = "Logout",
                        tint = RoseError,
                        modifier = Modifier.size(20.dp)
                    )
                }
            } else {
                // Lang toggle on login screen
                TextButton(
                    onClick = onToggleLang,
                    modifier = Modifier.testTag("toggle_lang_btn_guest")
                ) {
                    Text(
                        text = if (isBengali) "বাং" else "EN",
                        color = CyanAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    )
}
