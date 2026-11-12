plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "org.jaiflix.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "org.jaiflix.app"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    flavorDimensions += "device"
    productFlavors {
        create("mobile") { dimension = "device"; resValue("string", "app_name", "JAIFLIX") }
        create("tv") { dimension = "device"; resValue("string", "app_name", "JAIFLIX TV") }
    }

    buildTypes {
        debug { applicationIdSuffix = ".debug"; versionNameSuffix = "-debug" }
        release { isMinifyEnabled = false }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
