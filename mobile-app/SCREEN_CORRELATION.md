# Sana Pathology Lab: Web → Native Screen Correlation

| # | Web Page (frontend/src/pages/)               | Native Screen (mobile-app/src/screens/)        | Notes                           |
|---|-----------------------------------------------|------------------------------------------------|---------------------------------|
| 1 | `LoginPage.jsx`                               | `LoginScreen.js`                               | 3-tab login (STAFF/DOCTOR/PATIENT) |
| 2 | `Dashboard.jsx`                               | `DashboardScreen.js`                           | Stats cards + quick actions     |
| 3 | `PatientManagement.jsx`                       | `PatientsScreen.js`                            | List + add/edit modal + delete  |
| 4 | `PatientProfile.jsx`                          | `PatientProfileScreen.js`                      | Profile + personal/medical info |
| 5 | `Reports.jsx`                                 | `ReportsScreen.js`                             | List + status toggle + delete   |
| 6 | `CreateReport.jsx`                            | `CreateReportScreen.js`                        | 2-step wizard (tests → results) |
| 7 | `PrintReport.jsx`                             | `PrintReportScreen.js`                         | A4-style PDF preview            |
| 8 | `Doctors.jsx`                                 | `DoctorsScreen.js`                             | Approval + commission cards     |
| 9 | `DoctorAnalytics.jsx`                         | `DoctorAnalyticsScreen.js`                     | Referral ranking charts         |
| 10| `ManageTests.jsx`                             | `TestsScreen.js`                               | Category/price badge list       |
| 11| `Billing.jsx`                                 | `BillingScreen.js`                             | Invoices + payment modal        |
| 12| `Appointments.jsx`                            | `AppointmentsScreen.js`                        | Filterable list + booking modal |
| 13| `Inventory.jsx`                               | `InventoryScreen.js`                           | Filterable list + low-stock alerts |
| 14| `StaffManagement.jsx`                         | `StaffScreen.js`                               | List + add/edit + activate      |
| 15| `Setting.jsx`                                 | `SettingsScreen.js`                            | Lab info + signatories + config |
| 16| `WidalTest.jsx`                               | `WidalTestScreen.js`                           | Grid-based rapid slide method   |
| 17| *(Public Welcome)*                            | `PublicWelcomeScreen.js`                       | Landing page with brand + actions |
| 18| *(Public Appointment)*                        | `PublicAppointmentScreen.js`                   | Patient self-booking form       |
| 19| *(Public Print)*                              | `PublicPrintScreen.js`                         | Patient-facing report viewer    |
| 20| *(Report Lookup)*                             | `ReportLookupScreen.js`                        | Search reports by ID/mobile     |

## Navigation Structure

```
App.js
 └─ AuthProvider
     └─ AppNavigator (NavigationContainer)
          ├─ [user=null] → PublicStack
          │    ├─ PublicWelcome (landing)
          │    ├─ ReportLookup
          │    ├─ PublicPrint
          │    ├─ PublicAppointment
          │    └─ Login
          └─ [user exists] → AdminTabs (BottomTabNavigator)
               ├─ Home → DashboardScreen
               ├─ Patients → PatientsScreen
               ├─ Reports → ReportsScreen
               ├─ Billing → BillingScreen
               └─ More → MoreStack (NativeStackNavigator)
                    ├─ Dashboard, Patients, PatientProfile
                    ├─ Reports, CreateReport, PrintReport
                    ├─ Doctors, DoctorAnalytics
                    ├─ Tests, Billing, Appointments
                    ├─ Inventory, Staff, Settings
                    └─ WidalTest
```

## API Consumption

All screens use `src/services/api.js` which calls:
- Base URL: `https://sana-pathology-backend.onrender.com/api`
- Auth token stored as `sana_user` in AsyncStorage
- Endpoints match backend controllers (patients, reports, tests, billing, appointments, inventory, staff, settings, doctors, auth)

## Removed/Replaced Dependencies (vs Web)

| Web Library          | Native Replacement                |
|----------------------|-----------------------------------|
| react-router-dom    | @react-navigation/*               |
| localStorage        | @react-native-async-storage/async-storage |
| Chart.js            | react-native-chart-kit            |
| react-select        | FlatList-based pickers            |
| lucide-react        | Unicode/emoji icons               |
| xlsx                | *(removed – no Excel export in native)* |
