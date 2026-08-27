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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ClientInfo
import com.example.model.UserRole
import com.example.ui.theme.*

@Composable
fun LoginScreen(
    clients: List<ClientInfo>,
    isBengali: Boolean,
    onClientLogin: (String) -> Unit,
    onManagerLogin: (String, String) -> Unit,
    onNocLogin: (String, String) -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var inputCid by remember { mutableStateOf("") }
    var inputManagerUser by remember { mutableStateOf("manager") }
    var inputManagerPass by remember { mutableStateOf("admin123") }
    var inputNocUser by remember { mutableStateOf("noc") }
    var inputNocPass by remember { mutableStateOf("noc123") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepDarkBackground)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero ISP Branding Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(IndigoPrimary, CyanAccent)))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Brush.linearGradient(listOf(IndigoPrimary, CyanAccent))),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Router,
                            contentDescription = "Delta ISP",
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "DELTA MITHAPUKUR",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        letterSpacing = 1.sp
                    )

                    Text(
                        text = if (isBengali) "হাই-স্পিড অপটিক্যাল ফাইবার ব্রডব্যান্ড নেটওয়ার্ক" else "High-Speed Optical Fiber Broadband & NOC Desk",
                        fontSize = 12.sp,
                        color = CyanAccent,
                        fontWeight = FontWeight.Medium
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(EmeraldSuccess, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text("OLT Status: Online", fontSize = 11.sp, color = TextSecondary)
                        }
                        Text("•", color = TextMuted)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Phone, contentDescription = "Hotline", tint = CyanAccent, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("01700-000000", fontSize = 11.sp, color = TextSecondary)
                        }
                    }
                }
            }
        }

        // Login Role Selector Tabs
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = SurfaceDark,
                contentColor = IndigoPrimary,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.dp, CardBorderColor, RoundedCornerShape(12.dp))
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        Text(
                            text = if (isBengali) "গ্রাহক লগইন" else "Client CID",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = if (selectedTab == 0) CyanAccent else TextSecondary
                        )
                    },
                    icon = {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            tint = if (selectedTab == 0) CyanAccent else TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    modifier = Modifier.testTag("tab_client_login")
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Text(
                            text = if (isBengali) "ম্যানেজার" else "Manager",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = if (selectedTab == 1) IndigoPrimary else TextSecondary
                        )
                    },
                    icon = {
                        Icon(
                            Icons.Default.AdminPanelSettings,
                            contentDescription = null,
                            tint = if (selectedTab == 1) IndigoPrimary else TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    modifier = Modifier.testTag("tab_manager_login")
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = {
                        Text(
                            text = if (isBengali) "নোক টিম" else "NOC Squad",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = if (selectedTab == 2) EmeraldSuccess else TextSecondary
                        )
                    },
                    icon = {
                        Icon(
                            Icons.Default.Build,
                            contentDescription = null,
                            tint = if (selectedTab == 2) EmeraldSuccess else TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    modifier = Modifier.testTag("tab_noc_login")
                )
            }
        }

        // Tab Content
        when (selectedTab) {
            0 -> {
                // Client CID Login
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, CyanAccent.copy(alpha = 0.3f))))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = if (isBengali) "গ্রাহক আইডি (CID) বা ফোন নম্বর" else "Enter Subscriber Client ID (CID)",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = inputCid,
                                onValueChange = { inputCid = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("input_client_cid"),
                                placeholder = { Text("e.g. CID-1003 or 01712345678", color = TextMuted) },
                                leadingIcon = {
                                    Icon(Icons.Default.Badge, contentDescription = null, tint = CyanAccent)
                                },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Button(
                                onClick = {
                                    if (inputCid.isNotBlank()) {
                                        onClientLogin(inputCid.trim())
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                                    .testTag("btn_client_login_submit"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = Color.Black)
                            ) {
                                Icon(Icons.Default.Login, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (isBengali) "টিকেট পোর্টালে প্রবেশ করুন" else "Access Support Portal",
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // Fast Quick Login Demo Subscribers
                item {
                    Text(
                        text = if (isBengali) "⚡ দ্রুত ডেমো গ্রাহক নির্বাচন করুন:" else "⚡ Quick Demo Subscribers:",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextSecondary
                    )
                }

                items(clients) { client ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onClientLogin(client.cid) }
                            .testTag("demo_client_${client.cid}"),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, CardBorderColor)))
                    ) {
                        Row(
                            modifier = Modifier
                                .padding(12.dp)
                                .fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(Color(0xFF0F172A), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = client.cid.takeLast(2),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = CyanAccent
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = client.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = "${client.cid} • ${client.area}",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                            Icon(
                                imageVector = Icons.Default.ArrowForwardIos,
                                contentDescription = "Select",
                                tint = CyanAccent,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                }
            }

            1 -> {
                // Branch Manager Login
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, IndigoPrimary.copy(alpha = 0.4f))))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = if (isBengali) "ব্রাঞ্চ ম্যানেজার অ্যাডমিন প্যানেল" else "Branch Manager Admin Login",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = IndigoLight
                            )
                            Text(
                                text = if (isBengali) "মিঠাপুকুর জোন সাপোর্ট ও ডিসপ্যাচ কন্ট্রোল" else "Mithapukur Zone Dispatch & Analytics",
                                fontSize = 11.sp,
                                color = TextMuted
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            OutlinedTextField(
                                value = inputManagerUser,
                                onValueChange = { inputManagerUser = it },
                                label = { Text("Username") },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("input_manager_user"),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            OutlinedTextField(
                                value = inputManagerPass,
                                onValueChange = { inputManagerPass = it },
                                label = { Text("Password") },
                                visualTransformation = PasswordVisualTransformation(),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("input_manager_pass"),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { onManagerLogin(inputManagerUser, inputManagerPass) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                                    .testTag("btn_manager_login_submit"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = IndigoPrimary)
                            ) {
                                Icon(Icons.Default.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (isBengali) "ম্যানেজার ড্যাশবোর্ডে প্রবেশ" else "Login as Branch Manager",
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            2 -> {
                // NOC Team Login
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, EmeraldSuccess.copy(alpha = 0.4f))))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = if (isBengali) "নোক ও ফিল্ড ইঞ্জিনিয়ারিং পোর্টাল" else "NOC & Field Engineering Desk",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = EmeraldSuccess
                            )
                            Text(
                                text = if (isBengali) "অপটিক্যাল স্প্লাইসিং, সিগন্যাল মনিটর ও ফিল্ড টাস্ক" else "Optical Splicing, Field Squad & Line Health",
                                fontSize = 11.sp,
                                color = TextMuted
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            OutlinedTextField(
                                value = inputNocUser,
                                onValueChange = { inputNocUser = it },
                                label = { Text("NOC Username / Squad ID") },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("input_noc_user"),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            OutlinedTextField(
                                value = inputNocPass,
                                onValueChange = { inputNocPass = it },
                                label = { Text("Access PIN / Password") },
                                visualTransformation = PasswordVisualTransformation(),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("input_noc_pass"),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { onNocLogin(inputNocUser, inputNocPass) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(48.dp)
                                    .testTag("btn_noc_login_submit"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = EmeraldSuccess, contentColor = Color.Black)
                            ) {
                                Icon(Icons.Default.Engineering, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (isBengali) "নোক ডেস্কে প্রবেশ করুন" else "Access NOC Console",
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
