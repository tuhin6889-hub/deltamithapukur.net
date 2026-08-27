package com.example.data

import com.example.BuildConfig
import com.example.model.AiDiagnosis
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

@Serializable
data class GeminiRequest(
    val contents: List<GeminiContent>
)

@Serializable
data class GeminiContent(
    val parts: List<GeminiPart>
)

@Serializable
data class GeminiPart(
    val text: String
)

@Serializable
data class GeminiResponse(
    val candidates: List<GeminiCandidate>? = null
)

@Serializable
data class GeminiCandidate(
    val content: GeminiContent? = null
)

interface GeminiApiService {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GeminiRequest
    ): GeminiResponse
}

object GeminiClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        })
        .build()

    val service: GeminiApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(GeminiApiService::class.java)
    }

    suspend fun diagnoseTicket(
        ticketTitle: String,
        ticketDescription: String,
        category: String,
        area: String,
        clientName: String,
        cid: String,
        opticalPower: String,
        pingMs: Int
    ): AiDiagnosis = withContext(Dispatchers.IO) {
        val apiKey = try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Throwable) {
            ""
        }

        if (apiKey.isNotBlank() && apiKey != "MY_GEMINI_API_KEY") {
            try {
                val prompt = """
                    You are the AI Chief NOC Diagnostics System for "Delta Mithapukur", a high-speed Fiber Broadband ISP in Mithapukur, Rangpur, Bangladesh.
                    Analyze this client support ticket and respond with structured JSON only:
                    
                    Ticket Data:
                    - Client: $clientName (CID: $cid)
                    - Area: $area
                    - Category: $category
                    - Title: $ticketTitle
                    - Description: $ticketDescription
                    - Optical Power Reading: $opticalPower
                    - Ping Latency: ${pingMs}ms
                    
                    Please format your response strictly as valid JSON matching this exact structure:
                    {
                      "summaryBengali": "2-sentence root cause explanation in Bengali",
                      "nocSteps": ["step 1 in Bengali", "step 2 in Bengali", "step 3 in Bengali", "step 4 in Bengali"],
                      "clientReplyBengali": "Polite SMS/WhatsApp update draft for client in Bengali",
                      "recommendedPriority": "Urgent" | "High" | "Medium" | "Low"
                    }
                """.trimIndent()

                val request = GeminiRequest(
                    contents = listOf(
                        GeminiContent(parts = listOf(GeminiPart(text = prompt)))
                    )
                )

                val response = service.generateContent(apiKey, request)
                val rawText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
                if (!rawText.isNullOrBlank()) {
                    // Extract json if wrapped in ```json
                    val cleanedJson = rawText
                        .substringAfter("```json")
                        .substringAfter("```")
                        .substringBeforeLast("```")
                        .trim()
                    return@withContext json.decodeFromString<AiDiagnosis>(cleanedJson)
                }
            } catch (e: Exception) {
                // Fallback to offline ISP diagnostic logic
            }
        }

        // Domain-rich fallback diagnostic engine for Delta Mithapukur ISP
        val isLos = category.contains("LOS", ignoreCase = true) || ticketDescription.contains("LOS", ignoreCase = true) || opticalPower.contains("-3")
        val isHighPing = category.contains("পিং", ignoreCase = true) || pingMs > 100
        val isBilling = category.contains("বিলিং", ignoreCase = true) || category.contains("পেমেন্ট", ignoreCase = true)

        when {
            isLos -> AiDiagnosis(
                summaryBengali = "গ্রাহক $clientName ($cid) এর ড্রপ ফাইবার লাইনে রেড এলওএস ($opticalPower) সিগন্যাল লস রেকর্ড করা হয়েছে। পপ লুপে কন্টিনিউটি ব্রেক দেখা যাচ্ছে।",
                nocSteps = listOf(
                    "১. $area এলাকার ড্রপ ক্যাবল ও স্প্লিটার জয়েন্ট পোর্ট চেক করুন।",
                    "২. অপটিক্যাল পাওয়ার মিটার দিয়ে সিগন্যাল মেপে -২০ dBm এ সমন্বয় করুন।",
                    "৩. ফাইবার ফিউশন স্প্লাইসিং করে ড্রপ প্যাচ রি-টার্মিনেট করুন।",
                    "৪. গ্রাহকের ONU ডায়াল-আপ লিঙ্ক ওকে হলে টেস্ট সম্পন্ন করুন।"
                ),
                clientReplyBengali = "প্রিয় $clientName ($cid), ডেল্টা মিঠাপুকুর নোক টিম আপনার লাইনের ফাইবার সিগন্যাল ড্রপ সনাক্ত করেছে। ফিল্ড টেকনিশিয়ান মাঠে কাজ করছেন। দ্রুত সংযোগ সচল হবে।",
                recommendedPriority = "Urgent"
            )
            isHighPing -> AiDiagnosis(
                summaryBengali = "লাইনের লেটেন্সি ${pingMs}ms এবং অপটিক্যাল লেভেল $opticalPower। সাব-স্প্লিটারে অতিরিক্ত বেন্ডিং অথবা ব্যান্ডউইথ কনজেশন থাকতে পারে।",
                nocSteps = listOf(
                    "১. OLT আপলিঙ্ক পোর্ট ও VLAN ব্যান্ডউইথ ট্র্যাফিক মনিটর করুন।",
                    "২. গ্রাহকের রাউটার ডুপ্লেক্স ও MTU সাইজ (১৪৯২) যাচাই করুন।",
                    "৩. ONU প্যাচকর্ড পরিষ্কার ও ফাইবার ব্যান্ড লস দূর করুন।",
                    "৪. লো-পিং রাউটিং টেস্টিং নিশ্চিত করুন।"
                ),
                clientReplyBengali = "প্রিয় $clientName ($cid), হাই পিং ও বাফারিং সমস্যা সমাধানের জন্য নোক টিম আপনার গেটওয়ে রাউটিং অপটিমাইজ করছে। দ্রুত স্বাভাবিক গতি ফিরে পাবেন।",
                recommendedPriority = "High"
            )
            isBilling -> AiDiagnosis(
                summaryBengali = "বিলিং এবং পেমেন্ট রিকনসিলিয়েশন সংক্রান্ত আবেদন। বিকাশ ট্রানজাকশন ভেরিফাই করে ব্যালেন্স আপডেট করা প্রয়োজন।",
                nocSteps = listOf(
                    "১. রেডিয়াস/বিলিং সার্ভারে গ্রাহকের পেমেন্ট ট্রানজাকশন আইডি চেক করুন।",
                    "২. একাউন্ট স্ট্যাটাস এক্টিভ ও ব্যান্ডউইথ প্রোফাইল রিনিউ করুন।",
                    "৩. ইনভয়েস রিসিট জেনারেট করে এসএমএস ও ইমেইলে পাঠিয়ে দিন।"
                ),
                clientReplyBengali = "প্রিয় $clientName ($cid), আপনার বিলিং তথ্য পর্যালোচনা করা হয়েছে। কিছুক্ষণের মধ্যে ইনভয়েস কনফার্মেশন পাবেন। ধন্যবাদ!",
                recommendedPriority = "Medium"
            )
            else -> AiDiagnosis(
                summaryBengali = "গ্রাহক $clientName ($cid, $area) - $category সমস্যা সংক্রান্ত আবেদন দাখিল করেছেন। অপটিক্যাল সিগন্যাল $opticalPower।",
                nocSteps = listOf(
                    "১. মিঠাপুকুর সেন্ট্রাল নোক থেকে পোর্ট ট্রাফিক ও লিঙ্ক স্ট্যাটাস মনিটর করুন।",
                    "২. ONU রিস্টার্ট ও রাউটার কনফিগারেশন ভেরিফাই করুন।",
                    "৩. টেকনিশিয়ানকে ক্লায়েন্ট ভিজিটের জন্য শিডিউল করুন।"
                ),
                clientReplyBengali = "প্রিয় $clientName ($cid), ডেল্টা মিঠাপুকুর সাপোর্ট ডেস্ক আপনার বিষয়টি অগ্রাধিকার ভিত্তিতে গ্রহণ করেছে। শীঘ্রই সমাধান করা হবে।",
                recommendedPriority = "Medium"
            )
        }
    }
}
