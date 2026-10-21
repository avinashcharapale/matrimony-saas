import UIKit
import Capacitor
import UserNotifications
import FirebaseCore
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configure Firebase
        FirebaseApp.configure()
        
        // Set messaging delegate
        Messaging.messaging().delegate = self
        
        // Register for remote notifications
        registerForRemoteNotifications(application)
        
        // Set notification center delegate
        UNUserNotificationCenter.current().delegate = self
        
        // Handle launch from notification
        if let notification = launchOptions?[.remoteNotification] as? [String: AnyObject] {
            handleRemoteNotification(notification)
        }
        
        return true
    }

    private func registerForRemoteNotifications(_ application: UIApplication) {
        if #available(iOS 10.0, *) {
            let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
            UNUserNotificationCenter.current().requestAuthorization(options: authOptions) { granted, error in
                if granted {
                    DispatchQueue.main.async {
                        application.registerForRemoteNotifications()
                    }
                }
            }
        } else {
            let settings: UIUserNotificationSettings = UIUserNotificationSettings(types: [.alert, .badge, .sound], categories: nil)
            application.registerUserNotificationSettings(settings)
            application.registerForRemoteNotifications()
        }
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Set APNs token for Firebase
        Messaging.messaging().apnsToken = deviceToken
        
        // Convert token to string for backend registration
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("APNs token: \(tokenString)")
        
        // Send token to backend
        sendTokenToBackend(tokenString)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }

    // MARK: - UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .badge, .sound])
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        handleRemoteNotification(userInfo)
        completionHandler()
    }

    // MARK: - MessagingDelegate

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("FCM registration token: \(fcmToken ?? "")")
        if let token = fcmToken {
            sendTokenToBackend(token)
        }
    }

    // MARK: - Deep Links / Universal Links

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Handle custom URL scheme (matrimony-<tenant>://)
        print("Opened with custom URL: \(url)")
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Handle Universal Links (https://domain/...)
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            print("Opened with Universal Link: \(url)")
        }
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // MARK: - Helper Methods

    private func handleRemoteNotification(_ userInfo: [AnyHashable: Any]) {
        // Extract notification data
        let type = userInfo["type"] as? String ?? ""
        let targetId = userInfo["targetId"] as? String ?? ""
        
        print("Received push notification: type=\(type), targetId=\(targetId)")
        
        // TODO: Forward to Capacitor WebView via JavaScript bridge
        // This can be done by posting a notification that MainViewController observes
        NotificationCenter.default.post(name: .receivedPushNotification, object: nil, userInfo: userInfo)
    }

    private func sendTokenToBackend(_ token: String) {
        // TODO: Implement API call to register device token with your backend
        // Should be called after user logs in to associate token with user
        print("Sending token to backend: \(token)")
    }
}

extension Notification.Name {
    static let receivedPushNotification = Notification.Name("receivedPushNotification")
}