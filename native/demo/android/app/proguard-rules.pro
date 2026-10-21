# Capacitor / WebView keep rules
-keep class com.getcapacitor.** { *; }
-keep class com.capacitor.** { *; }
-keep class org.chromium.** { *; }

# Capacitor Plugins
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.getcapacitor.** { *; }

# Firebase / Google Services
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# AndroidX / Jetpack
-keep class androidx.** { *; }

# Kotlin Coroutines
-keep class kotlinx.coroutines.** { *; }

# OkHttp / Retrofit (if used via plugins)
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }

# Gson / Serialization
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep JS Interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Parcelable creators
-keep class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Enum values
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Prevent obfuscation of Capacitor plugin classes
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.PluginHandle { *; }

# Network Security Config
-keep class android.security.NetworkSecurityPolicy { *; }