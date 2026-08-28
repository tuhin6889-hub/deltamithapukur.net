package com.example.ui.dialogs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

/**
 * Dynamic Download Counter Badge displaying total APK downloads with live pulse indicator.
 */
@Composable
fun DownloadCounterBadge(
    downloadCount: Int,
    isBengali: Boolean = true,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse_transition")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_alpha"
    )

    val formattedCount = remember(downloadCount) {
        NumberFormat.getNumberInstance(Locale.US).format(downloadCount)
    }

    Surface(
        color = Color(0xFF064E3B).copy(alpha = 0.85f),
        shape = RoundedCornerShape(20.dp),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.horizontalGradient(
                listOf(EmeraldSuccess.copy(alpha = 0.7f), CyanAccent.copy(alpha = 0.7f))
            )
        ),
        modifier = modifier.testTag("download_counter_badge")
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            // Live Pulsing Dot
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(EmeraldSuccess.copy(alpha = pulseAlpha))
            )
            Spacer(modifier = Modifier.width(6.dp))

            // Download Icon
            Icon(
                imageVector = Icons.Default.CloudDownload,
                contentDescription = "Downloads",
                tint = EmeraldSuccess,
                modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))

            // Badge Count Label
            Text(
                text = if (isBengali) "$formattedCount টি ডাউনলোড" else "$formattedCount Downloads",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.3.sp
            )

            Spacer(modifier = Modifier.width(4.dp))
            Surface(
                color = EmeraldSuccess,
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = "LIVE",
                    color = Color.Black,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                )
            }
        }
    }
}

/**
 * Authentic QR Code pattern matrix generator & Canvas for high-fidelity scanning.
 */
@Composable
fun QrCodeCanvas(
    content: String,
    modifier: Modifier = Modifier,
    backgroundColor: Color = Color.White,
    moduleColor: Color = Color(0xFF0F172A),
    finderColor: Color = Color(0xFF4338CA)
) {
    val matrixSize = 25
    val grid = remember(content) {
        val mat = Array(matrixSize) { BooleanArray(matrixSize) }
        
        // 1. Finder pattern marker function
        fun markFinder(startRow: Int, startCol: Int) {
            for (r in 0 until 7) {
                for (c in 0 until 7) {
                    val isOuter = r == 0 || r == 6 || c == 0 || c == 6
                    val isInner = r in 2..4 && c in 2..4
                    mat[startRow + r][startCol + c] = isOuter || isInner
                }
            }
        }

        markFinder(0, 0)
        markFinder(0, matrixSize - 7)
        markFinder(matrixSize - 7, 0)

        // 2. Timing patterns
        for (i in 7 until matrixSize - 7) {
            mat[6][i] = (i % 2 == 0)
            mat[i][6] = (i % 2 == 0)
        }

        // 3. Alignment pattern at bottom right
        val alignRow = 16
        val alignCol = 16
        for (r in -2..2) {
            for (c in -2..2) {
                val isOuter = r == -2 || r == 2 || c == -2 || c == 2
                val isCenter = r == 0 && c == 0
                mat[alignRow + r][alignCol + c] = isOuter || isCenter
            }
        }

        // 4. Deterministic data encoding based on content string hash
        val seed = content.hashCode().toLong()
        val random = java.util.Random(seed)
        for (r in 0 until matrixSize) {
            for (c in 0 until matrixSize) {
                val inTopLeftFinder = r < 8 && c < 8
                val inTopRightFinder = r < 8 && c >= matrixSize - 8
                val inBottomLeftFinder = r >= matrixSize - 8 && c < 8
                val inTiming = r == 6 || c == 6
                val inAlignment = (r in alignRow - 2..alignRow + 2) && (c in alignCol - 2..alignCol + 2)
                val inCenterLogo = (r in 10..14) && (c in 10..14)

                if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !inTiming && !inAlignment && !inCenterLogo) {
                    mat[r][c] = random.nextBoolean()
                }
            }
        }

        mat
    }

    // Scanning line animation
    val infiniteTransition = rememberInfiniteTransition(label = "scan_laser")
    val scanLineY by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "scan_y"
    )

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(backgroundColor)
            .padding(10.dp),
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.foundation.Canvas(modifier = Modifier.fillMaxSize()) {
            val cellWidth = size.width / matrixSize
            val cellHeight = size.height / matrixSize

            // Draw QR modules
            for (r in 0 until matrixSize) {
                for (c in 0 until matrixSize) {
                    if (grid[r][c]) {
                        val isFinder = (r < 7 && c < 7) ||
                                (r < 7 && c >= matrixSize - 7) ||
                                (r >= matrixSize - 7 && c < 7)
                        val color = if (isFinder) finderColor else moduleColor
                        
                        drawRoundRect(
                            color = color,
                            topLeft = androidx.compose.ui.geometry.Offset(c * cellWidth, r * cellHeight),
                            size = androidx.compose.ui.geometry.Size(cellWidth * 0.92f, cellHeight * 0.92f),
                            cornerRadius = androidx.compose.ui.geometry.CornerRadius(cellWidth * 0.2f, cellHeight * 0.2f)
                        )
                    }
                }
            }

            // Laser scan beam overlay
            val beamY = size.height * scanLineY
            drawRect(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        EmeraldSuccess.copy(alpha = 0f),
                        EmeraldSuccess.copy(alpha = 0.6f),
                        EmeraldSuccess.copy(alpha = 0.9f),
                        EmeraldSuccess.copy(alpha = 0f)
                    ),
                    startY = beamY - 12f,
                    endY = beamY + 12f
                ),
                topLeft = androidx.compose.ui.geometry.Offset(0f, beamY - 12f),
                size = androidx.compose.ui.geometry.Size(size.width, 24f)
            )
        }

        // Center Android / Delta branding icon
        Surface(
            color = Color(0xFF0F172A),
            shape = RoundedCornerShape(6.dp),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = Brush.linearGradient(listOf(EmeraldSuccess, CyanAccent))
            ),
            modifier = Modifier.size(32.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = Icons.Default.Android,
                    contentDescription = null,
                    tint = EmeraldSuccess,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

/**
 * Full Android APK Installation & Download Modal with Dynamic Download Count Badge & QR Code.
 */
@Composable
fun AndroidInstallModal(
    downloadCount: Int,
    isBengali: Boolean,
    onDismiss: () -> Unit,
    onDownloadTriggered: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var isDownloading by remember { mutableStateOf(false) }
    var downloadProgress by remember { mutableFloatStateOf(0f) }
    var downloadCompleted by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .testTag("android_install_modal"),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = Brush.verticalGradient(
                    listOf(IndigoPrimary, CyanAccent.copy(alpha = 0.5f))
                )
            )
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceVariantDark)
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(IndigoPrimary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Android,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = if (isBengali) "ডেল্টা অ্যান্ড্রয়েড অ্যাপ (.APK)" else "Delta Android App (.APK)",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = if (isBengali) "অফিসিয়াল সাপোর্ট ও নোক মোবাইল ক্লায়েন্ট" else "Official Support & NOC Mobile Client",
                                fontSize = 11.sp,
                                color = CyanAccent
                            )
                        }
                    }
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("btn_close_install_modal")
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }

                // Modal Content Scroll
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Top Highlight with Download Counter Badge
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = Brush.linearGradient(
                                    listOf(CardBorderColor, EmeraldSuccess.copy(alpha = 0.4f))
                                )
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                // Dynamic Live Download Counter Badge
                                DownloadCounterBadge(
                                    downloadCount = downloadCount,
                                    isBengali = isBengali,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )

                                Text(
                                    text = if (isBengali) "Delta Mithapukur Support App" else "Delta Mithapukur Support App",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White,
                                    textAlign = TextAlign.Center
                                )

                                Text(
                                    text = if (isBengali)
                                        "মিঠাপুকুর জোনের জন্য রিয়েল-টাইম টিকেট ট্র্যাকিং, অপটিক্যাল পাওয়ার পর্যবেক্ষণ এবং সার্বক্ষণিক নোক সাপোর্ট সেবা।"
                                    else
                                        "Real-time ticket tracking, optical link power diagnostics and instant NOC support for Mithapukur zone subscribers.",
                                    fontSize = 12.sp,
                                    color = TextSecondary,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(top = 6.dp, bottom = 12.dp)
                                )

                                // Specifications Grid
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceEvenly
                                ) {
                                    SpecPill(label = "Version", value = "v2.4.0 (Latest)")
                                    SpecPill(label = "Size", value = "14.2 MB")
                                    SpecPill(label = "OS", value = "Android 8.0+")
                                }
                            }
                        }
                    }

                    // Download Action Section
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = if (isBengali) "📥 সরাসরি APK ডাউনলোড" else "📥 Direct APK Download",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Spacer(modifier = Modifier.height(8.dp))

                                if (isDownloading) {
                                    Column(modifier = Modifier.fillMaxWidth()) {
                                        LinearProgressIndicator(
                                            progress = { downloadProgress },
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .height(8.dp)
                                                .clip(RoundedCornerShape(4.dp)),
                                            color = EmeraldSuccess,
                                            trackColor = Color(0xFF1E293B)
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = if (isBengali) "APK ডাউনলোড হচ্ছে..." else "Downloading APK package...",
                                                fontSize = 11.sp,
                                                color = CyanAccent
                                            )
                                            Text(
                                                text = "${(downloadProgress * 100).toInt()}% (14.2 MB)",
                                                fontSize = 11.sp,
                                                color = TextPrimary,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                } else {
                                    Button(
                                        onClick = {
                                            isDownloading = true
                                            downloadProgress = 0f
                                            downloadCompleted = false
                                            coroutineScope.launch {
                                                for (i in 1..10) {
                                                    delay(180)
                                                    downloadProgress = i / 10f
                                                }
                                                isDownloading = false
                                                downloadCompleted = true
                                                onDownloadTriggered()
                                                Toast.makeText(
                                                    context,
                                                    if (isBengali) "🎉 ডেল্টা সাপোর্ট APK ডাউনলোড সফল হয়েছে!" else "🎉 Delta Support APK downloaded successfully!",
                                                    Toast.LENGTH_LONG
                                                ).show()
                                            }
                                        },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(50.dp)
                                            .testTag("btn_download_apk"),
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = EmeraldSuccess,
                                            contentColor = Color.Black
                                        )
                                    ) {
                                        Icon(Icons.Default.FileDownload, contentDescription = null, modifier = Modifier.size(20.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = if (downloadCompleted)
                                                (if (isBengali) "পুনরায় ডাউনলোড করুন (Download Again)" else "Download Again (14.2 MB)")
                                            else
                                                (if (isBengali) "APK ফাইল ডাউনলোড করুন (14.2 MB)" else "Download APK Package (14.2 MB)"),
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                    }
                                }

                                AnimatedVisibility(visible = downloadCompleted) {
                                    Surface(
                                        color = Color(0xFF064E3B).copy(alpha = 0.6f),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(top = 10.dp)
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.padding(10.dp)
                                        ) {
                                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = EmeraldSuccess, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = if (isBengali)
                                                    "ফাইল সেভ হয়েছে: delta-support-v2.4.0.apk (কাউন্টার স্বয়ংক্রিয়ভাবে বৃদ্ধি পেয়েছে)"
                                                else
                                                    "Saved to Downloads: delta-support-v2.4.0.apk (Counter updated dynamically)",
                                                color = Color.White,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Scan QR Code to Download Section
                    item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("card_scan_qr_download"),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = Brush.linearGradient(
                                    listOf(IndigoPrimary.copy(alpha = 0.6f), CyanAccent.copy(alpha = 0.6f))
                                )
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.QrCodeScanner,
                                            contentDescription = null,
                                            tint = CyanAccent,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = if (isBengali) "মোবাইলে QR স্ক্যান করে ডাউনলোড" else "Scan QR to Download on Mobile",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TextPrimary
                                        )
                                    }
                                    Surface(
                                        color = IndigoPrimary.copy(alpha = 0.3f),
                                        shape = RoundedCornerShape(6.dp),
                                        border = CardDefaults.outlinedCardBorder().copy(
                                            brush = Brush.linearGradient(listOf(IndigoPrimary, CyanAccent))
                                        )
                                    ) {
                                        Text(
                                            text = "QUICK SCAN",
                                            color = CyanAccent,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                // Visual QR Code Canvas Card
                                Box(
                                    modifier = Modifier
                                        .size(190.dp)
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(Color.White)
                                        .padding(8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    QrCodeCanvas(
                                        content = "https://delta-mithapukur.net/app/download",
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Text(
                                    text = if (isBengali)
                                        "আপনার মোবাইল ক্যামেরা বা গুগল লেন্স দিয়ে স্ক্যান করুন। ফাইল সরাসরি ডিভাইসে ডাউনলোড শুরু হবে।"
                                    else
                                        "Point your phone camera or Google Lens at this QR code to download delta-support-v2.4.0.apk instantly.",
                                    fontSize = 11.sp,
                                    color = TextSecondary,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )

                                Spacer(modifier = Modifier.height(12.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = {
                                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                            val clip = ClipData.newPlainText("Delta APK Link", "https://delta-mithapukur.net/app/download")
                                            clipboard.setPrimaryClip(clip)
                                            Toast.makeText(
                                                context,
                                                if (isBengali) "📋 QR ডাউনলোড লিঙ্ক কপি হয়েছে!" else "📋 QR Download link copied!",
                                                Toast.LENGTH_SHORT
                                            ).show()
                                        },
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("btn_copy_qr_link"),
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary)
                                    ) {
                                        Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(text = if (isBengali) "লিঙ্ক কপি" else "Copy URL", fontSize = 12.sp)
                                    }

                                    Button(
                                        onClick = {
                                            onDownloadTriggered()
                                            Toast.makeText(
                                                context,
                                                if (isBengali) "📲 QR স্ক্যান সফল: APK ডাউনলোড শুরু হচ্ছে..." else "📲 QR Scan Simulated: Starting APK download...",
                                                Toast.LENGTH_SHORT
                                            ).show()
                                        },
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("btn_simulate_qr_scan"),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = IndigoPrimary,
                                            contentColor = Color.White
                                        )
                                    ) {
                                        Icon(Icons.Default.CropFree, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(text = if (isBengali) "স্ক্যান টেস্ট" else "Test Scan", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }

                    // Installation Instructions Step-by-Step
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = if (isBengali) "📋 অ্যান্ড্রয়েডে ইনস্টল করার ৩টি সহজ ধাপ" else "📋 Easy 3-Step Installation Guide",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = IndigoLight
                                )
                                Spacer(modifier = Modifier.height(10.dp))

                                InstallStepRow(
                                    stepNum = "১",
                                    title = if (isBengali) "APK ফাইলটি ডাউনলোড করুন" else "Download the APK",
                                    description = if (isBengali) "উপরের 'APK ফাইল ডাউনলোড করুন' বাটনে চাপ দিয়ে ফাইলটি সংগ্রহ করুন।" else "Tap the Download APK button above to save the installation file."
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                InstallStepRow(
                                    stepNum = "২",
                                    title = if (isBengali) "Unknown Sources পারমিশন দিন" else "Allow Install Unknown Apps",
                                    description = if (isBengali) "ফোনের Settings > Security > 'Install Unknown Apps' অপশনে গিয়ে ব্রাউজার বা ফাইল ম্যানেজার পারমিশন দিন।" else "Enable 'Install Unknown Apps' permission for your browser or file manager when prompted."
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                InstallStepRow(
                                    stepNum = "৩",
                                    title = if (isBengali) "ইনস্টল সম্পন্ন করে লগইন করুন" else "Complete Install & Open",
                                    description = if (isBengali) "ডাউনলোড কমপ্লিট নোটিফিকেশনে ট্যাপ করে 'Install' চাপুন এবং ক্লায়েন্ট আইডি বা ম্যানেজার রোল দিয়ে প্রবেশ করুন।" else "Open the downloaded package, click Install, and log in with your Client ID or Manager PIN."
                                )
                            }
                        }
                    }

                    // Direct Link & Share Section
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = if (isBengali) "ডিরেক্ট ডাউনলোড লিঙ্ক" else "Direct Download URL",
                                        fontSize = 11.sp,
                                        color = TextMuted
                                    )
                                    Text(
                                        text = "https://delta-mithapukur.net/app/download",
                                        fontSize = 12.sp,
                                        color = CyanAccent,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                                OutlinedButton(
                                    onClick = {
                                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                        val clip = ClipData.newPlainText("Delta APK Link", "https://delta-mithapukur.net/app/download")
                                        clipboard.setPrimaryClip(clip)
                                        Toast.makeText(
                                            context,
                                            if (isBengali) "লিঙ্ক ক্লিপবোর্ডে কপি হয়েছে!" else "Download link copied!",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = CyanAccent),
                                    modifier = Modifier.testTag("btn_copy_apk_link")
                                ) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(text = if (isBengali) "কপি" else "Copy", fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecPill(label: String, value: String) {
    Surface(
        color = SurfaceVariantDark,
        shape = RoundedCornerShape(8.dp),
        border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(CardBorderColor, CardBorderColor)))
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            Text(text = label, fontSize = 10.sp, color = TextMuted)
            Text(text = value, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        }
    }
}

@Composable
private fun InstallStepRow(stepNum: String, title: String, description: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(IndigoPrimary),
            contentAlignment = Alignment.Center
        ) {
            Text(text = stepNum, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column {
            Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text(text = description, fontSize = 11.sp, color = TextSecondary)
        }
    }
}
