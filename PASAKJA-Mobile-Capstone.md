# PASAKJA: A MOBILE APP COMMUNITY TRANSPORTATION BOOKING & DISPATCHING SYSTEM

---

An Undergraduate Thesis / Capstone Project Presented to  
The Faculty of College of Information Technology  
Bucas Grande Foundation College  
Socorro, Surigao del Norte

---

In Partial Fulfilment of the Requirements for the Diploma in  
INFORMATION TECHNOLOGY

DAPHNIE DANE V. SUPERO  
JUDY-ANN P. PUNO  
LEEROSE T. GUMA

2026

---

## APPROVAL SHEET

This capstone Project entitled **PASAKJA: A MOBILE APP COMMUNITY TRANSPORTATION BOOKING & DISPATCHING SYSTEM**

Prepared and submitted by Judy-Ann P. Puno, Daphnie Dane V. Supero, Leerose T. Guma

Has been examined and is recommended for approval and acceptance

_____________________________________________________________

Approved by the committee on oral Examination during proposal with a grade of ______ on ________________

______________  
Chairman

_____________________                    _____________________  
Member                                   Member

_____________________  
Rhea Jean Belsondra, MIT  
Dean, College of Information Technology

ACCEPTED in partial fulfillment of the degree Diploma in Information Technology.

---

## ACKNOWLEDGEMENT

The researchers would like to express their sincere gratitude to all individuals and institutions who contributed to the success of this study.

First and foremost, we thank our Almighty God for granting us the strength, wisdom, and perseverance throughout the course of our research.

Our heartfelt appreciation goes to our research adviser, Jun Tan, for his invaluable guidance, encouragement, and constructive feedback, which greatly improved the quality of our work. We are also deeply grateful to the Dean of the College of Information Technology, Rhea Jean Belsondra, MIT.

We are thankful to our co-researchers for their assistance and encouragement. Lastly, we dedicate this work to our families and loved ones for their unwavering support, understanding, and patience.

Thank you all for being part of this meaningful journey.

Daphnie Dane V. Supero  
Judy-Ann P. Puno  
Leerose T. Guma

---

## ABSTRACT

Community transportation in Socorro, Surigao del Norte has long relied on manual and informal booking practices, resulting in inefficient dispatching, unclear fare structures, long passenger waiting times, and a lack of accountability between drivers and commuters. While a web-based booking platform can digitize these operations, most passengers and drivers in the community already use smartphones as their primary device. This study presents **Pasakja: A Mobile App Community Transportation Booking and Dispatching System**, a native Android application that brings ride booking, driver dispatching, live GPS tracking, payments, and emergency response onto the phone.

The mobile application was built with Expo (React Native) and Expo Router, using TypeScript, Google Maps, Expo Location, Expo Notifications, Expo Secure Store, and Expo Image Picker. It connects to the existing Pasakja Next.js backend and PostgreSQL database so that booking rules, fares, payments, and user records remain consistent with the web platform. The app serves three user roles — Passenger, Driver, and Administrator — each with a phone-appropriate interface. Key features include camera-based KYC document capture, GPS-assisted map booking with fare estimates and nearby-driver markers, cash and GCash payment, live trip tracking, driver online/offline GPS broadcast, earnings monitoring, push notifications, an emergency SOS alert, and a reduced admin module for dashboard stats, bookings, driver verification, SOS alerts, and GCash dispute resolution.

The system was designed to be evaluated using the ISO/IEC 9126 software quality model across six quality criteria: functionality, efficiency, usability, reliability, maintainability, and portability. Pasakja demonstrates how a native mobile client, backed by a shared community transportation backend, can make booking and dispatching practical for everyday use in a local Philippine context.

**Keywords:** *mobile application, ride booking, transportation dispatching, GPS tracking, fare computation, community transportation, Expo, React Native, Android, Philippines, push notifications, GCash, document verification*

---

## TABLE OF CONTENTS

|  | Title | Page |
|--|-------|------|
|  | APPROVAL SHEET | i |
|  | ACKNOWLEDGEMENT | ii |
|  | ABSTRACT | iii |
|  | TABLE OF CONTENTS | iv |
|  | LIST OF FIGURES | v |
| 1 | INTRODUCTION | |
|  | Project Context | |
|  | Purpose and Description | |
|  | Research Objectives | |
|  | Scope and Limitations of the Study | |
|  | Significance of the Study | |
| 2 | REVIEW OF RELATED LITERATURE / SYSTEMS | |
|  | Synthesis | |
| 3 | TECHNICAL BACKGROUND | |
| 4 | METHODOLOGY | |
| 5 | RESULTS AND DISCUSSION | |
| 6 | SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS | |
|  | Summary | |
|  | Conclusions | |
|  | Recommendations | |
|  | References | |
|  | APPENDIX | |
|  | CURRICULUM VITAE | |

---

## LIST OF FIGURES

| Figure | Title |
|--------|-------|
| Figure 1 | System Login Interface |
| Figure 2 | Registration Interface — Passenger and Driver |
| Figure 3 | Role-Based Mobile Navigation |
| Figure 4 | Passenger Home Interface |
| Figure 5 | Ride Booking Interface |
| Figure 6 | Live Trip Tracking Interface |
| Figure 7 | My Trips Interface |
| Figure 8 | Passenger Profile Interface |
| Figure 9 | Emergency SOS Interface |
| Figure 10 | Driver Home Interface |
| Figure 11 | Driver Requests Interface |
| Figure 12 | Driver Trip Interface |
| Figure 13 | Driver Earnings Interface |
| Figure 14 | Driver Profile Interface |
| Figure 15 | Admin Dashboard Interface |
| Figure 16 | Admin Bookings Interface |
| Figure 17 | Admin Driver Management Interface |
| Figure 18 | Admin SOS and Disputes Interface |

---

# CHAPTER 1

# INTRODUCTION

Transportation plays an important role in our community by helping people move to their destination safely and quickly. As technology improves, transportation services have become more modern and convenient. However, many communities in the Philippines, especially in local areas like Socorro, Surigao del Norte, still face problems such as difficulty in finding rides — wasting time while waiting, missing trips, unclear fare prices, and a lack of security. Drivers also experience challenges in looking for passengers, monitoring their income, uneven earnings, and a lack of organized dispatching.

Adekola et al. (2021) studied how road transport ticket booking can be moved from manual, counter-based systems to an online platform. Traditionally, passengers had to book tickets in person at transport terminals, which caused long wait times and other problems. The researchers proposed a digital booking system that lets travelers and transport employees buy and sell tickets online, improving convenience and reducing delays.

Moreover, Dexter (2025) studied how local systems and services can be improved through technology-based solutions, focusing on student-led capstone projects that address practical problems in communities. Traditionally, many operations relied on manual processes, paper records, and in-person interactions, which caused inefficiencies and delays. The researcher proposed various digital solutions, including web-based management systems, mobile applications, and automation tools, to improve accessibility, operational efficiency, and user experience.

In the Philippine setting, commuters already use mobile ride-hailing applications such as Grab, Joyride, and Angkas for motorcycle taxis and tricycles in larger cities. Those platforms show that passengers and drivers expect booking, tracking, and payment to happen on a phone. In Socorro, however, community transport — tricycles, habal-habal, and bao-bao — still depends on street hailing, text messages, and informal arrangements. A browser-only system can digitize the process, but it is less convenient when the user is standing on the roadside, driving, or handling a booking with one hand.

In response to these needs, this study proposes **Pasakja: A Mobile App Community Transportation Booking & Dispatching System**. The system is designed to connect passengers, drivers, and administrators through a native Android application that simplifies ride booking, dispatching, monitoring, and management within the community. It provides a simple and reliable way for passengers to book rides using their phones. At the same time, it gives drivers an organized system for receiving bookings and navigating to their destinations. It uses modern mobile technology such as device GPS, live map tracking, camera-based identity documents, push notifications, and online payment options to improve the whole riding experience.

### Project Context

Pasakja is a mobile application developed to improve the process of booking and managing community transportation services in Socorro, Surigao del Norte. The application uses the phone’s GPS to allow passengers to book rides and track drivers in real time. It also supports automatic fare computation and multiple payment options, including cash and GCash.

The mobile app is a second, native client for the existing Pasakja platform. It talks to the same Next.js backend and PostgreSQL database as the web application, so booking rules, fares, payments, and driver/passenger data stay in sync. There is no separate mobile backend. Fare, booking status, and payment state are always resolved on the server. Anything computed on the phone, such as a fare preview before booking, is only a preview; the server recomputes and persists the authoritative value.

The system is composed of three main user groups: passengers, drivers, and administrators. Each user group has specific functions that help improve transportation efficiency, safety, and management. Features such as shared-ride requests, live maps, push notifications, and an SOS button are included to enhance convenience and passenger safety. The admin experience on the phone is intentionally reduced to tasks that make sense on a mobile device — dashboard stats, booking oversight, driver KYC approval, SOS alerts, and GCash dispute resolution. Desk work such as fare and zone configuration, full analytics reports, and remittance management remains on the web application.

### Purpose and Description

The purpose of developing Pasakja: A Mobile App Community Transportation Booking and Dispatching System is to improve the efficiency, accessibility, and reliability of transportation services within the community by placing booking and dispatching on the device people already carry. The system aims to address common problems such as difficulty in booking rides, unclear fare calculation, delayed dispatching, lack of real-time updates, and the inconvenience of using a desktop-oriented website while traveling.

Pasakja is a native Android application developed to manage transportation booking and dispatching processes in an organized and efficient manner. It serves as a mobile platform where passengers can request rides, drivers can receive and manage bookings, and administrators can monitor operations that require timely response. The system uses device GPS and Google Maps to support accurate location tracking and navigation, ensuring timely and reliable transportation services. The system includes the following key features:

- **Passenger Booking and Registration:** Passengers can register on the phone, capture KYC documents with the camera or gallery, and book rides using GPS-based map services.
- **Automatic Fare Calculation and Payments:** The system automatically calculates fares and allows payments through cash or GCash. A configurable platform fee (15%) is added on top of the trip fare paid by the passenger; drivers receive the full base trip fare without deduction.
- **Real-Time Tracking:** Passengers can track the driver on a live map during trips. Drivers can also view the passenger’s current location while a trip is active.
- **Trip Records and Ratings:** The system stores trip history and allows passengers to rate drivers to maintain service quality.
- **Driver Registration and Verification:** Drivers complete a verification process by uploading license and vehicle documents. Only verified drivers can go online and accept bookings.
- **Nearby Driver Selection:** Passengers can see nearby online drivers on the booking map and optionally send a request to a preferred driver.
- **Booking Notifications and Trip Progression:** Drivers receive incoming ride requests through the app and through push notifications. They walk a trip through accept, confirm pickup, start, and complete.
- **Earnings and Availability Management:** Drivers can go online or offline, broadcast live GPS while the app is in the foreground, and view earnings.
- **Administrative Mobile Oversight:** Administrators can view dashboard statistics, review all bookings, approve or suspend drivers, resolve SOS alerts, and decide GCash disputes from the phone.
- **Safety Features:** An SOS button captures GPS coordinates and notifies administrators. Optional shared-ride requests and counterparty profile viewing during active trips further support safety.

### Research Objectives

The development of Pasakja: A Mobile App Community Transportation Booking & Dispatching System is guided by a set of general and specific objectives aimed at improving Socorro, Surigao del Norte community transportation services through mobile technology.

#### General Objectives

The general objectives of this study are to enhance the efficiency and accessibility of community transportation services through the digitization and automation of ride booking and dispatching on a mobile application; to improve passenger convenience and satisfaction by providing a phone-based booking experience with live tracking and transparent fare computation; to support drivers by enabling efficient ride allocation, availability management, and earnings monitoring from an Android device; to assist administrators in handling time-sensitive operations such as driver verification, SOS alerts, and payment disputes; to promote safety and reliability by incorporating driver verification, GPS tracking, push notifications, and emergency features; and to ensure system quality, security, and reliability while adhering to established software development standards.

#### Specific Objectives

The study is generally aimed at developing a mobile community transportation booking and dispatching application that seeks to:

1. Design and implement a native Android application that allows passengers to register, capture identity documents, and book rides from their phones.
2. Develop an automated fare calculation flow with support for cash and GCash payment methods, including an in-app browser checkout and deep-link return to the app.
3. Integrate device GPS and Google Maps so passengers can monitor driver location during trips and drivers can locate passengers during pickup.
4. Create a driver module that enables verified drivers to go online, receive nearby booking requests, progress a trip, and view earnings.
5. Develop a phone-appropriate administrative module for dashboard statistics, booking oversight, driver KYC approval or suspension, SOS alert handling, and GCash dispute resolution.
6. Incorporate safety and communication features such as an SOS emergency button, push notifications for booking and alert events, and optional shared-ride requests.
7. Generate trip history and ratings that remain consistent with the shared backend used by the web platform.
8. Ensure data security, access control, and proper user authentication for passengers, drivers, and administrators using a mobile Bearer JWT in place of a browser cookie session.
9. Develop a system that conforms to established standards such as ISO 9126 in terms of functionality, usability, reliability, efficiency, maintainability, portability, and accessibility.

### Scope and Limitations of the Study

This section defines what Pasakja: A Mobile App Community Transportation Booking & Dispatching System is designed to accomplish and identifies the limitations and challenges that may be encountered during its development, implementation, and use.

#### Scope of the Study

The scope of this study includes the development and evaluation of a native Android mobile application that allows passengers to register and book transportation services from a phone. The application automatically computes fares and supports both cash and online payment methods, with fares displayed as a transparent breakdown of trip fare, platform fee, and total amount payable by the passenger. Device GPS and Google Maps enable passengers to track drivers in real time during trips, while the system also provides estimated trip duration and distance between selected pickup and destination points. Nearby online drivers can be shown on the booking map.

For drivers, the application supports registration and verification (license and vehicle documents captured by camera or gallery), booking requests, availability settings, live GPS broadcast while the app is in the foreground, trip progression, and earnings monitoring.

Passengers may upload identity and supporting documents as photos for administrative review, similar to the driver verification workflow. An administrative mobile module is provided for dashboard statistics, all-bookings oversight, driver KYC approval or suspension, SOS alerts, and GCash dispute resolution. The application stores trip history and allows passengers to rate drivers after each trip. Push notifications inform users of booking, SOS, and dispute events when the app is installed as a standalone Android build.

The mobile application uses the existing Pasakja web backend as its single source of truth. Booking rules, fare math, and payment logic are not reimplemented on the phone.

#### Limitations of the Study

The study is limited to a specific community in Socorro, Surigao del Norte, and the application is intended for Android. It was designed for testing among selected passengers, drivers, and administrators.

The application requires a stable internet connection and a GPS-enabled Android device. Location is captured in the foreground only; the study does not implement background GPS tracking, in order to avoid Android’s stricter background-location requirements at capstone scale.

KYC documents on mobile are photos only (camera or gallery). PDF upload, which is available on the web application, is not included in the mobile client.

The administrative module on the phone is intentionally reduced. Fare and zone configuration, full analytics reports, passenger directory management, remittance management, and system settings remain web-only.

Online payment functionality depends on the availability and reliability of third-party payment service providers. In this study, GCash checkout was demonstrated using a PayMongo test account only, and production use was not implemented or evaluated. Real GCash payouts and live transactions require an approved business or duly registered sole proprietor merchant account with the payment provider, and this study does not claim compliance with or completion of those legal and commercial requirements. GCash also has a ₱20 minimum charge enforced by PayMongo; very short trips below that amount must use cash.

Routing and ETA use the same public, rate-limited OSRM demo server already used by the web platform. Push notifications require a standalone Android build (EAS), an Expo project, and Firebase Cloud Messaging credentials; they are not available inside Expo Go on the SDK used by this project.

Budget, time, and technological resources may further limit the scope and features of the system. Data privacy and security concerns may limit access to real operational data during system testing and evaluation.

### Significance of the Study

The relevance of this study is described from the following perspectives:

**Passengers.** Pasakja benefits passengers by providing a convenient and reliable way to book rides from a smartphone. Features such as live driver tracking, automatic fare computation, cash and GCash payment, trip history, driver ratings, document verification, trip time estimates, fare breakdown with platform fee, and the ability to view the assigned driver’s profile help improve passenger convenience, safety, and overall travel experience.

**Drivers.** Drivers benefit from the system through ride request notifications on the phone, GPS guidance to pickup and destination, flexible online/offline availability, and access to earnings information. The system helps reduce idle time, improve trip management, and increase income opportunities. Drivers benefit from seeing the passenger’s live location during pickup, viewing passenger profile details during a trip, and receiving the full base trip fare without platform fee deduction from their earnings.

**Community Transportation Operators.** The system assists operators by organizing transportation services through centralized booking, standardized fares, driver management, and operational records that stay consistent between the mobile app and the web platform. This improves service coordination, transparency, and overall efficiency.

**Administrators.** Administrators benefit from having a phone-ready subset of oversight tools — dashboard statistics, bookings, driver KYC, SOS alerts, and payment disputes — so urgent cases can be handled away from a desk. Full configuration and reporting remain available on the web application.

**Educational Institutions.** The completion of this study contributes to the improvement of quality education by serving as a practical example of a real-world mobile application that consumes a shared backend. It can be used as a reference project for students studying information technology, mobile development, and related fields.

**Future Researchers.** The study serves as a reference for future research related to mobile transportation systems, community mobility solutions, and digital service platforms. The application may be used as a basis for further studies and system enhancements, including iOS support, background location, and production payments.

---

# CHAPTER 2

# REVIEW OF RELATED LITERATURE / SYSTEMS

This chapter reviews existing literature and studies related to the development of Pasakja: A Mobile App Community Transportation Booking & Dispatching System. It focuses on previous works and technologies involving mobile and web-based transportation systems, ride booking platforms, dispatching methods, GPS tracking, fare calculation, online payment services, and smartphone-based community transport applications. The purpose of this review is to identify useful ideas, features, and challenges from existing systems that can help guide the design of the proposed mobile application. It also provides a foundation for understanding how the proposed system improves or differs from existing transportation solutions and supports the objectives of this study.

Ulay, D. A. L. L., Domingo, A. D. D., Beran, C. J. A., Lazarte, A. L. S., et al. (2025) developed and evaluated an internet-based mobile application designed to improve tricycle reservation systems in San Jose, Occidental Mindoro. The study explained how the system enables passengers to register, view available tricycles, and confirm bookings through a mobile interface. The findings revealed that the application reduces waiting time, improves communication between drivers and passengers, and minimizes inefficiencies associated with traditional manual booking methods. The researchers also emphasized that the app enhances operational efficiency by providing real-time updates and automated booking records.

This study supports the implementation of Pasakja, as the system is likewise a mobile application that allows users to book community rides anytime and anywhere from a phone. By improving accessibility and user experience on Android, Pasakja modernizes local transport service delivery while addressing the limitations of conventional booking practices and of browser-only systems that are harder to use while traveling.

Pizarro, Gumabay, and Gumarang (2025) developed and evaluated the TC-TRISSEA mobile application, designed to enhance the safety, satisfaction, and service quality of tricycle commuters in Tuguegarao City. The study explained that the app allows passengers to access driver profiles, track rides in real time, and provide feedback through a mobile interface. The findings revealed that the application significantly improved commuter safety, ensured proper fare payments, and promoted accountability among drivers. IT experts also rated the app as highly compliant with ISO 25010 software quality standards, confirming its usability and reliability.

This study demonstrates how mobile applications can improve local transport systems by addressing inefficiencies, enhancing user experience, and increasing commuter confidence in tricycle services — making it directly relevant to Pasakja’s passenger tracking, driver profiles, ratings, and safety features.

Joyride Group, Inc. (2022) developed Joyride, a Philippine-based ride-hailing platform designed to modernize last-mile transportation by enabling passengers to book motorcycle taxis and tricycles through a mobile application. The system integrates real-time GPS tracking, automated fare computation, cashless payment through GCash and other digital wallets, and a driver verification process that requires background checks and vehicle registration prior to onboarding. Joyride serves passengers in Metro Manila and key provincial areas, offering a safe and organized alternative to the conventional practice of flagging down tricycles and motorcycles on the street. The platform also provides trip history records, mutual driver and passenger rating systems, and in-app customer support to enhance service accountability and user confidence.

This system is highly relevant to Pasakja as both platforms aim to modernize community-level transport services in the Philippine context through a mobile client. Pasakja draws from Joyride’s approach to driver verification, cashless payment integration, real-time GPS tracking, and user rating systems. However, Pasakja extends these features by targeting a defined community (Socorro) with three vehicle types — tricycle, habal-habal, and bao-bao — and by giving administrators a mobile oversight module plus a web console for fare, zone, and remittance work that consumer-oriented applications like Joyride do not offer to a local transport operator.

Angkas, Inc. (2023) operates Angkas, a motorcycle taxi booking platform that became one of the first Transport Network Vehicle Service (TNVS) applications to be officially regulated by the Land Transportation Franchising and Regulatory Board (LTFRB) in the Philippines. The platform allows passengers to book motorcycle taxi rides through a mobile application, with features including real-time driver tracking via GPS, automated fare calculation based on distance, mandatory helmet provisioning, and a two-way rating system for drivers and passengers. Angkas implements driver accreditation through background checks, driving skills assessments, and mandatory safety briefings to ensure service quality and passenger protection. The platform’s booking interface provides passengers with estimated fares, driver information, and trip monitoring functionality both before and during the ride, contributing to a transparent and accountable service experience.

This system is relevant to Pasakja as it demonstrates the critical role of driver accountability systems, transparent fare structures, and GPS-based real-time tracking in building a reliable and trustworthy community transportation platform. Pasakja incorporates similar mechanisms for driver management and fare estimation while extending the system to accommodate multiple community vehicle types and providing both a mobile interface and a centralized administrative backend for community transportation operations.

Grab Holdings Inc. (2023) operates Grab, one of Southeast Asia’s largest and most comprehensive super applications, offering transportation services across eight countries including the Philippines. The Grab transport platform provides GrabCar, GrabBike, GrabTrike, and other vehicle-type-specific booking services through an intelligent algorithm-driven dispatching system that automatically matches passengers with nearby available drivers based on proximity, vehicle type, and estimated time of arrival. Key platform features include real-time GPS navigation, upfront fare estimation, multiple payment options encompassing both cash and GrabPay, safety tools such as an emergency SOS button and trip-sharing functionality, and a dual rating system for both drivers and passengers.

This system is directly relevant to Pasakja as it illustrates the scalable design of a multi-modal, GPS-driven, and algorithmically dispatched transportation booking platform delivered as a mobile app. Pasakja adopts core concepts from Grab’s platform — including real-time GPS tracking, nearby-driver matching, fare estimation, and emergency SOS alert features — and adapts them to serve community-level transport needs. Unlike Grab, which operates at a large commercial scale across multiple countries, Pasakja focuses specifically on community transport management in Socorro and provides administrators with direct oversight of drivers, bookings, SOS alerts, and disputes.

Cramer and Krueger (2016) studied the disruptive impact of Uber’s digital platform on the traditional taxi industry, focusing on how algorithmic driver-passenger matching, transparent fare pricing, and GPS navigation transformed the ride-hailing service model. The study found that Uber drivers achieved significantly higher vehicle utilization rates compared to conventional taxi drivers, attributed to the platform’s efficient digital dispatching system that eliminates the need for manual radio dispatch or physical queuing at taxi stands. The researchers further noted that Uber’s standardized passenger and driver rating system promotes accountability and encourages consistent service quality, while the real-time GPS tracking feature provides both transparency and safety assurance for passengers.

These findings provide foundational context for the design of Pasakja. The core platform principles established by Uber — automated dispatching, upfront fare computation, real-time GPS tracking, and a mutual accountability rating system — have since been adapted by numerous localized transportation applications, including Grab, Joyride, and Angkas. Pasakja applies these same evidence-based principles within a community transport setting on Android, demonstrating how proven global ride-hailing innovations can be adapted to the unique transportation needs of Socorro.

Iliopoulou and Kepaptsoglou (2019) presented a comprehensive review of Intelligent Transportation Systems (ITS) and their application in public transportation management. The study explained that Transportation Management Systems (TMS) utilize information and communication technologies to support vehicle assignment, route planning, scheduling, and operational control. According to the authors, the integration of optimization techniques and real-time data improves decision-making in transport operations and enhances the overall efficiency of transportation services.

This literature is relevant to the Pasakja system because it applies similar ITS principles to manage different community transport modes such as tricycles, habal-habal, and bao-bao. By systematically assigning vehicles to passengers and monitoring transport operations through a mobile client and a shared backend, Pasakja ensures timely service delivery and effective utilization of transport resources within the community.

Adekola et al. (2021) developed and evaluated a web-based online road transport booking system designed to replace traditional manual booking processes. The study described how the system allows passengers to register, select transport services, and confirm bookings through an online interface. The findings revealed that online booking systems significantly reduce passenger waiting time and eliminate the need for physical presence at booking stations.

This study supports the implementation of Pasakja, as the system similarly digitizes booking so passengers no longer need to wait at a terminal or hail a vehicle on the street. Pasakja goes further by delivering that booking flow as a native mobile application, which is the device passengers and drivers already use while traveling.

AbdelAziz et al. (2019) examined the use of Global Positioning System (GPS) technology in transportation systems to improve vehicle tracking and travel time estimation. The study explained that GPS-based tracking enables real-time monitoring of vehicle movement, which helps transport operators manage fleets more effectively. It also allows passengers to receive accurate information regarding vehicle location and estimated arrival time. The researchers emphasized that GPS integration improves route planning, reduces uncertainty in travel, and enhances transparency in transport services.

These findings are directly applicable to Pasakja, as the application uses Expo Location and Google Maps to capture and display the real-time location of assigned vehicles and, during active trips, the passenger. This feature allows passengers to monitor their rides while enabling drivers to navigate efficiently to pickup and drop-off locations.

Estrada-Esquivel et al. (2022) discussed the development of a smart web-based information system for urban transportation using Internet of Things (IoT) technologies. The study highlighted that networked platforms provide continuous system access, real-time information updates, and improved interaction between passengers and transport operators. The authors noted that such systems enhance communication, reduce information gaps, and support better decision-making for both users and administrators.

This study is relevant to Pasakja because the mobile application connects passengers, drivers, and administrators to one shared information platform. Through the app, users can perform bookings, view trip information, monitor vehicle status, and manage transport operations. Push notifications further reduce information gaps when the user is not looking at the screen.

Barrera Hernandez et al. (2025) investigated adaptive dispatching and scheduling systems in public transportation. The study explained that intelligent dispatching mechanisms use real-time data, passenger demand, and vehicle availability to optimize vehicle allocation. The results showed that adaptive dispatching reduces service delays, improves response time, and enhances operational efficiency.

This literature supports the design of Pasakja’s dispatching feature. By showing nearby online drivers, allowing a preferred-driver request, and matching available verified drivers to passenger requests, Pasakja ensures timely and reliable community transport services.

### Synthesis

The compilation of literature and studies presented in this chapter provides a comprehensive understanding of how technology transforms community transportation systems. The synthesis of these studies highlights a common theme: the integration of mobile platforms, GPS tracking, intelligent dispatching, and real-time information significantly enhances operational efficiency, service reliability, and user convenience. Across the reviewed research, it is evident that technology enables systematic vehicle management, streamlines booking processes, improves route planning, and facilitates seamless interaction between passengers, drivers, and administrators.

The reviewed literature shows that digital and intelligent technologies are increasingly being used to improve community and public transportation. Traditional manual transport processes often result in long waiting times, poor coordination, and limited access to services, while mobile-based systems offer faster, more organized, and more user-friendly transportation solutions. Local studies by Ulay et al. (2025) and Pizarro, Gumabay, and Gumarang (2025) show that digital reservation and monitoring systems for tricycles improve passenger convenience, safety, and communication between drivers and commuters when delivered as mobile applications. These studies confirm that features such as in-app booking, vehicle tracking, and access to driver information help increase passenger trust and satisfaction. These findings support Pasakja’s goal of modernizing community transportation through a native Android application.

Philippine-based commercial platforms further support these results. Joyride Group, Inc. (2022) and Angkas, Inc. (2023) demonstrate that locally contextualized ride-hailing platforms with GPS tracking, cashless payments, and driver verification can be successfully adopted in Philippine communities — and that they are delivered as mobile apps, not websites. Grab Holdings Inc. (2023) provides a larger-scale example of multi-modal, algorithmically dispatched transportation, with features such as SOS alerts and dual rating systems. These platforms validate the feature set implemented in Pasakja and confirm that a phone-first client is the expected interface for this kind of service.

International studies provide additional foundational support. Cramer and Krueger (2016) established that data-driven, digitally dispatched platforms outperform manual radio-dispatch systems in vehicle utilization, service quality, and accountability — principles that Pasakja directly applies. Iliopoulou and Kepaptsoglou (2019) emphasize the role of Intelligent Transportation Systems in improving vehicle assignment, scheduling, and routing using real-time data. Similarly, Barrera Hernandez et al. (2025) highlight that adaptive dispatching and smart scheduling reduce delays and improve service response. In addition, Adekola et al. (2021) confirm that digital booking systems reduce waiting time and remove the need for physical booking locations, while AbdelAziz et al. (2019) show that GPS tracking improves route planning, transparency, and reliability. Estrada-Esquivel et al. (2022) also stress the importance of networked information systems for real-time updates and effective communication.

Altogether, these studies indicate that combining mobile booking, intelligent dispatching, GPS tracking, and real-time information systems leads to a more efficient and user-centered transportation service. Pasakja builds on these concepts to improve community-based transport services in Socorro. The studies of Ulay et al. (2025) and Pizarro, Gumabay, and Gumarang (2025) are the most closely related to Pasakja due to their shared Philippine context, mobile delivery, and focus on community-level tricycle and ride-hailing services.

---

# CHAPTER 3

# TECHNICAL BACKGROUND

This chapter presents the technologies, frameworks, and tools used in the development of Pasakja: A Mobile App Community Transportation Booking & Dispatching System. Each technology was selected to support the system’s goals of reliability, security, and ease of use on Android, while remaining consistent with the shared Pasakja backend.

### Mobile Application Technologies

#### Expo (React Native) and Expo Router

Expo is a framework and toolchain for building native Android and iOS applications with React Native. React Native allows a single TypeScript codebase to render native user interface components rather than a mobile web page. Expo Router provides file-based navigation similar to a modern web app router, which keeps passenger, driver, and admin screens organized as route groups.

Expo was selected for Pasakja because it supports maps, location, camera, secure storage, push notifications, and in-app browsers without requiring a local Android SDK for everyday development. Cloud builds through EAS produce an installable APK for demonstration and evaluation.

#### TypeScript

TypeScript is a typed superset of JavaScript that adds static type checking to the development process. It improves code quality, reduces runtime errors, and enhances developer productivity. TypeScript is used throughout the Pasakja mobile codebase to ensure that data models — such as bookings, drivers, and passengers — are consistently handled with type safety across screens and API modules.

#### React Native Maps (Google Maps SDK)

`react-native-maps` renders native map views. On Android, Pasakja uses the Google Maps SDK so passengers can pick pickup and drop-off points, see nearby drivers, and follow a live trip. Map tiles and markers replace a text-only coordinate display and improve spatial awareness during booking and tracking.

#### Expo Location

Expo Location accesses the device GPS while the application is in the foreground. Pasakja uses it to capture the passenger’s pickup point, broadcast the driver’s position when the driver is online or on a trip, share the passenger’s live location during an active booking, and attach coordinates to SOS alerts. Foreground-only location was an intentional scope decision for this capstone.

#### Expo Notifications

Expo Notifications, together with Expo’s push service and Firebase Cloud Messaging, delivers system notifications when a booking is created, accepted, completed, or cancelled, and when an SOS alert or GCash dispute is created or resolved. A registered Expo push token is stored on the user record so the backend can target the correct device.

#### Expo Secure Store

Expo Secure Store persists the mobile authentication token in the device keystore. Unlike a website, a native HTTP client cannot rely on NextAuth browser cookies. The mobile app stores a Bearer JWT issued by a dedicated mobile session endpoint and attaches it to every API request.

#### Expo Image Picker

Expo Image Picker lets users capture or choose photos for KYC documents and profile images. Driver registration requires a driver’s license and vehicle registration photo. Passengers may upload a government ID, proof of address, selfie with ID, or other supporting photo. Files are uploaded through the same backend upload routes used by the web application and stored via Cloudinary.

#### Expo Web Browser and Expo Linking

Expo Web Browser opens PayMongo’s GCash checkout in an in-app browser. PayMongo requires an `http(s)` return URL, so the backend provides a small mobile-bridge route that immediately redirects into the app’s `pasakja://payment-return` deep link. Expo Linking registers that scheme so the passenger returns to the trip screen after authorizing payment.

#### EAS Build

EAS Build compiles the Android application in the cloud. A `preview` profile produces a standalone APK for demonstration. A `development` profile produces a dev-client APK for live reload during development. Push notifications and the custom deep-link scheme are fully available only in a built APK, not in Expo Go.

### Shared Backend and Database

The Next.js web application remains the single source of truth. The mobile app is a thin client: it does not reimplement booking rules, fare math, or payment logic. Shared business-logic files such as commission rates and vehicle types are copied from the web application into the mobile `src/lib/` folder and marked as mirrors of the source of truth.

#### Next.js API Routes and Node.js

Node.js powers the Next.js server layer. Existing API routes for bookings, drivers, location, SOS, profile, uploads, PayMongo, and admin statistics were extended to accept either a NextAuth cookie session (web) or a Bearer JWT (mobile). Additive mobile-only routes include `POST /api/mobile/session` for login and `POST /api/mobile/register-push-token` for push registration.

#### PostgreSQL and Prisma ORM

PostgreSQL stores users, bookings, trips, ratings, earnings, zones, fares, notifications, SOS alerts, and verification documents. Prisma provides a type-safe client and migrations. The only database change introduced for mobile is an additive, nullable `User.pushToken` column for the device’s Expo push token. Every other model is used exactly as the web application already defined it.

#### Authentication Bridge

`POST /api/mobile/session` runs the same credential check as the web login and issues a Bearer JWT instead of a cookie. A shared `lib/api-auth.ts` on the backend accepts either token type, so every route serves both clients from one implementation. Passwords remain hashed with bcryptjs. Zod validation on the server continues to reject invalid booking, registration, and payment payloads.

#### Cloudinary

Cloudinary stores and serves profile images and verification document photos. The mobile app uploads through the existing backend routes; the database stores the resulting URL.

#### PayMongo

PayMongo provides GCash checkout. The mobile payment flow creates a payment intent, opens the checkout in an in-app browser, and returns through the mobile-bridge deep link. This study uses a PayMongo test account. Production payments require a verified merchant account.

#### OSRM

Trip distance and estimated duration are computed through the Open Source Routing Machine (OSRM) public routing API, the same service used by the web application. When pickup and destination coordinates are selected, the system requests a driving route and returns distance in kilometers and duration in minutes.

#### Platform Commission Model

Pasakja applies a 15% platform fee on top of the base trip fare. The passenger pays the sum of trip fare and platform fee; the driver earns the full base trip fare upon trip completion. Fare breakdown components are displayed consistently across booking, trip history, and payment flows.

---

# CHAPTER 4

# METHODOLOGY

### 4.1 Research Design

This study uses a developmental and applied systems design approach focused on planning, implementing, and evaluating a mobile transportation booking and dispatching application for community use. The project follows an iterative development model where core modules are built, tested, and refined based on functional requirements and role-based workflows on Android.

### 4.2 Development Model

The project follows iterative phases:

**Phase 1: Requirements Analysis**  
Identify user roles, process pain points, and mobile-specific requirements for passengers, drivers, and administrators. Distinguish phone-appropriate admin work from desk-only configuration that should remain on the web.

**Phase 2: System Design**  
Define the thin-client architecture, authentication bridge (Bearer JWT), navigation (bottom tabs for passenger and driver; stack for admin), map and location flows, and API usage against the existing backend.

**Phase 3: Implementation**  
Develop screens and API modules using Expo, Expo Router, TypeScript, React Native Maps, Expo Location, Expo Notifications, Expo Secure Store, and Expo Image Picker. Add only the backend routes and the `pushToken` column required for mobile.

**Phase 4: Testing and Validation**  
Validate role-based behaviors, booking lifecycle updates, GCash return via deep link, SOS submission, and data consistency with the web platform.

**Phase 5: Deployment and Documentation**  
Prepare EAS Build configuration, environment variables (`API_BASE_URL`, Google Maps Android key), and technical/user documentation for running the backend and installing the APK.

### 4.3 System Architecture

The implemented system uses a client–server architecture.

- **Mobile client (this study):** Expo / React Native application with role-based route groups (`app/passenger`, `app/driver`, `app/admin`, `app/(auth)`). Typed API modules in `src/api/` wrap `fetch` calls. Auth state lives in `AuthContext` with the JWT in Secure Store.
- **Backend (shared with the web app):** Next.js API routes, Prisma, PostgreSQL. `getAuthUser()` accepts a mobile Bearer JWT or a NextAuth cookie. Booking, fare, and payment logic execute only on the server.
- **External services:** Google Maps (Android map rendering), Expo Location (device GPS), Expo Push / FCM (notifications), Cloudinary (images), PayMongo (GCash), OSRM (route distance and duration).

Access control is implemented through separate Passenger, Driver, and Admin navigators. After login, the app redirects to the home route for the user’s role. Users who are not authenticated are sent to the login screen.

### 4.4 Data Gathering Procedure

Data gathering for system requirements was based on:

- Observed local transportation flow and common user concerns in Socorro, Surigao del Norte;
- Stakeholder-oriented feature mapping (passenger, driver, admin);
- Capability alignment with community constraints (Android phones, GPS-ready workflows, cash and GCash, camera-based documents); and
- Review of the existing Pasakja web platform so the mobile client would reuse booking rules rather than invent a second set of rules.

### 4.5 Tools and Technologies

| Technology | Purpose |
|---|---|
| Expo (React Native) + Expo Router | Native Android application and file-based navigation |
| TypeScript | Type-safe development |
| React Native Maps (Google Maps) | Booking and live trip maps |
| Expo Location | Foreground GPS capture and broadcast |
| Expo Notifications | Device push notifications |
| Expo Secure Store | Auth token storage |
| Expo Image Picker | KYC and profile photos |
| Expo Web Browser + Linking | GCash checkout and `pasakja://` return |
| EAS Build | Cloud APK builds |
| Next.js API (shared backend) | Booking, auth, payments, admin, SOS |
| PostgreSQL + Prisma ORM | Relational data and migrations |
| NextAuth (web) + mobile JWT | Dual-client authentication |
| Cloudinary | Profile and document image storage |
| PayMongo | GCash online payment |
| OSRM | Route distance and duration estimates |

### 4.6 Database Design Summary

The data model is the same normalized schema used by the web platform. Key entities include:

- **User** — base identity, role (Passenger, Driver, Admin), and optional `pushToken`
- **Passenger, Driver, Admin** — role-specific profile data
- **Booking** — ride request with pickup/dropoff coordinates and addresses, status, quoted base fare, passenger total fare (including platform fee), payment method, and payment status
- **Trip** — active trip record linked to a completed booking
- **Rating** — post-trip rating by passenger for driver
- **Earning** — driver earning record per completed trip
- **Zone, Fare** — geographic zones and associated fare rates (configured on the web; consumed by mobile fare estimates)
- **Notification** — system messages per user; also used to trigger Expo push delivery
- **SosAlert** — emergency alert submitted by passenger
- **PassengerDocument / DriverDocument** — verification files
- **PassengerLocation** — live GPS coordinates shared by passengers during active bookings

This model supports booking lifecycle management, financial tracking, service quality scoring, administrative monitoring, emergency handling, and mobile push targeting.

### 4.7 Ethical and Security Considerations

The system adopts role-based authentication, controlled access to screens, and secure password hashing on the server. The mobile token is stored in Secure Store rather than plain AsyncStorage. API responses were reviewed so booking and SOS payloads do not include password hashes or other unnecessary user fields. Operational records are stored for transparency and accountability. Data privacy and minimal exposure of user details are considered in API design. The system complies with the principle of least privilege — each user role can only access the data and functions relevant to their role. Location is requested only while the app is in the foreground.

---

# CHAPTER 5

# RESULTS AND DISCUSSION

### Implementation Results and System Evaluation

This chapter presents the outcomes and achievements of Pasakja: A Mobile App Community Transportation Booking & Dispatching System developed for the community of Socorro, Surigao del Norte. It assesses the system’s effectiveness in managing transportation bookings through GPS-assisted map booking, role-based mobile navigation, automated fare computation, live dispatch workflows, push notifications, and emergency response. Key results obtained during implementation are discussed below.

### Implementation Results

This section summarizes what was built and demonstrated in the working system. The application is a native Android client using Expo (SDK 57), React Native, Expo Router, TypeScript, Google Maps, Expo Location, Expo Notifications, Expo Secure Store, Expo Image Picker, Expo Web Browser, and Expo Linking. It authenticates against `POST /api/mobile/session` and calls the same backend used by the Pasakja web application. The system serves three distinct user roles — Passenger, Driver, and Administrator — each with a dedicated, role-protected navigator.

Please refer to the Appendices for sample screenshots of all user interfaces and demo credentials.

---

### Authentication and Access Control

**Figure 1. System Login Interface**

*[Insert screenshot of the login screen here]*

Route: `app/(auth)/login`

The login screen is the public entry point of the mobile application. It presents the Pasakja wordmark and the tagline “Community rides for Socorro,” then asks for email and password. Only users with valid credentials can enter their respective home screens. A successful login stores a Bearer JWT in Secure Store and redirects by role.

**Key Features:**
- Email and password authentication
- Loading state on the Log In button
- Alert dialog for missing fields or invalid credentials
- Automatic role-based redirection after login:
  - ADMIN → `/admin`
  - DRIVER → `/driver`
  - PASSENGER → `/passenger`
- Link to the registration screen for new users

**Security Implementation:**
- Passwords hashed with bcryptjs on the server (same as the web app)
- JWT issued by the mobile session endpoint
- Token stored in Expo Secure Store
- Unauthenticated users remain on the auth stack

---

**Figure 2. Registration Interface — Passenger and Driver**

*[Insert screenshot of the registration screen here]*

Route: `app/(auth)/register`

The registration screen lets a new user choose Passenger or Driver and collects role-specific information. Documents are captured with the camera or chosen from the gallery, then uploaded through the existing backend upload routes.

**Passenger Registration Fields:**
- Full name (required)
- Email address (required, unique)
- Phone number
- Password (required)
- Optional verification photos: Government-Issued ID, Proof of Address, Selfie with ID, Other

**Driver Registration Fields:**
- Full name, email, phone, password (required as applicable)
- License number (required, unique)
- Vehicle type (Tricycle, Habal-habal, or Bao-bao)
- Vehicle plate number and model (required)
- Required photos: Driver’s License and Vehicle Registration (OR/CR)
- Optional: Government-Issued ID

**Business Rules:**
- Duplicate email addresses are rejected
- Drivers are registered with a PENDING status and must be verified by an administrator before they can go online or accept bookings
- Passengers are immediately active upon registration
- Public registration cannot create an administrator account
- KYC files on mobile are images only (no PDF)

---

### Role-Based Navigation

**Figure 3. Role-Based Mobile Navigation**

*[Insert screenshot of passenger and driver tab bars here]*

After login, passengers and drivers use a bottom tab bar. Administrators use a stack navigator with a teal header, which is more appropriate for a smaller set of oversight screens.

**Navigation Modules by Role:**

| Module | Route | Passenger | Driver | Admin |
|---|---|---|---|---|
| Home / Dashboard | `/passenger`, `/driver`, `/admin` | ✓ | ✓ | ✓ |
| Book a Ride | `/passenger/book` | ✓ | — | — |
| My Trips | `/passenger/trips` | ✓ | — | — |
| Live Trip (hidden tab) | `/passenger/trip` | ✓ | — | — |
| Emergency SOS | `/passenger/sos` | ✓ | — | — |
| Profile | `.../profile` | ✓ | ✓ | ✓ |
| Requests | `/driver/requests` | — | ✓ | — |
| Trip | `/driver/trip` | — | ✓ | — |
| Earnings | `/driver/earnings` | — | ✓ | — |
| All Bookings | `/admin/bookings` | — | — | ✓ |
| Driver Management | `/admin/drivers` | — | — | ✓ |
| SOS & Disputes | `/admin/sos` | — | — | ✓ |

The passenger live-tracking Trip screen is registered but hidden from the tab bar (`href: null`). It is opened from the Home active-booking banner or automatically after a successful booking. Push-notification taps also route the user to the relevant screen.

---

### Passenger Module

#### Passenger Home

**Figure 4. Passenger Home Interface**

*[Insert screenshot of the passenger home screen here]*

Route: `app/passenger/index`

The passenger home screen is the central hub for passenger operations. It greets the user by time of day and first name.

**Interface Components:**
- Personalized greeting and subtitle
- Active booking card when a ride is Pending, Accepted, Picked Up, or In Progress, with status badge, drop-off address, and a View Trip button
- “Ready to go?” prompt and Book a Ride button when no ride is active
- Statistics: total bookings, completed trips, and pending bookings
- Recent bookings list with status badges

---

#### Book a Ride Interface

**Figure 5. Ride Booking Interface**

*[Insert screenshot of the booking map screen here]*

Route: `app/passenger/book`

The booking screen is built around a Google Map. The passenger’s GPS seeds the pickup point. Drop-off (and pickup, if changed) can be set by tapping the map or by searching a Socorro place in a destination search modal.

**Form and Map Features:**
- Pickup and drop-off pins on the map
- Searchable Socorro place gazetteer
- Reverse geocoding of tapped coordinates into an address
- Nearby online driver markers; optional preferred-driver selection
- Shared ride toggle and optional notes
- Payment method: Cash or GCash
- Route polyline with OSRM distance and duration
- Fare estimate breakdown: trip fare, 15% platform fee, and passenger total

**Payment Flow:**
- **Cash:** Booking is submitted directly; payment is settled in person
- **GCash:** PayMongo checkout opens in an in-app browser; after Authorize Test Payment (test mode), the mobile-bridge route returns the user to `pasakja://payment-return` and the trip screen. Charges under ₱20 are blocked with a warning to use cash instead

**Business Rules:**
- GPS permission is required for a convenient pickup default
- A passenger may not have more than one active booking at a time
- The fare shown before confirm is a preview; the server stores the authoritative fare

---

#### Live Trip Tracking Interface

**Figure 6. Live Trip Tracking Interface**

*[Insert screenshot of the passenger trip tracking screen here]*

Route: `app/passenger/trip`

The live trip screen is opened after booking or from the home banner. It shows a tracking map, a status timeline (Requested → Accepted → Picked Up → In Progress → Completed), driver details when assigned, fare and payment status, and cancel (before pickup). The passenger’s location is broadcast while this flow is active so the driver can find them.

---

#### Trip History Interface

**Figure 7. My Trips Interface**

*[Insert screenshot of the trips history screen here]*

Route: `app/passenger/trips`

The trip history screen displays all bookings made by the logged-in passenger, ordered by most recent. Completed trips can be rated. Fare breakdown, payment method, driver name, and status are shown on each card.

**Booking Lifecycle Statuses:**
Pending, Accepted, Picked Up, In Progress, Completed, Cancelled

---

#### Passenger Profile Interface

**Figure 8. Passenger Profile Interface**

*[Insert screenshot of the passenger profile screen here]*

Route: `app/passenger/profile`

The profile screen displays the logged-in user’s account information and supports a profile photo update via camera or gallery (Cloudinary URL saved through the backend).

**Profile Information Displayed:**
- Profile image
- Full name and role badge
- Email address and phone number
- Sign out control

---

#### Emergency SOS Interface

**Figure 9. Emergency SOS Interface**

*[Insert screenshot of the SOS screen here]*

Route: `app/passenger/sos`

The SOS screen is always available from the passenger tab bar. A large pulsing Send SOS button, haptic feedback, an optional message field, and local emergency numbers (PNP 117, Bureau of Fire Protection 160, NDRRMC 911) are provided.

**Key Features:**
- GPS coordinates captured via Expo Location
- Fallback to Socorro town-center coordinates (9.6234, 125.9685) if GPS is unavailable, so the alert is still submitted
- Alert stored with passenger identity, coordinates, timestamp, and message
- Administrators see the alert on the Admin SOS & Disputes screen
- Push notification is sent when an alert is created or resolved

---

### Driver Module

#### Driver Home

**Figure 10. Driver Home Interface**

*[Insert screenshot of the driver home screen here]*

Route: `app/driver/index`

The driver home screen is the central hub for driver operations. Verified drivers can toggle Online / Offline. While online and the app is in the foreground, GPS is broadcast so passengers can see the driver on the booking map.

**Interface Components:**
- Personalized greeting
- Driver status badge: Verified / Pending / Suspended
- Online/offline switch with a live pulse indicator when available
- Statistics such as completed trips
- Notice for pending or suspended drivers that they cannot accept bookings until verified or restored

**Business Rules:**
- Only Verified drivers can toggle availability
- Suspended drivers cannot access booking features
- Location broadcast is foreground-only

---

#### Driver Requests Interface

**Figure 11. Driver Requests Interface**

*[Insert screenshot of the driver requests screen here]*

Route: `app/driver/requests`

The requests screen lists incoming PENDING bookings that have no assigned driver (or that targeted this driver) and the driver’s currently accepted trip if any. The list refreshes on a poll so new requests appear without a manual reload. Push notifications also alert the driver when a booking is created.

**Booking Card Information:**
- Passenger name
- Pickup and drop-off addresses
- Payment method and fare
- Estimated duration and distance when available
- Notes and shared-ride indicator

**Primary Action:**
- **Accept** — assigns the driver; booking status becomes Accepted

---

#### Driver Trip Interface

**Figure 12. Driver Trip Interface**

*[Insert screenshot of the driver trip screen here]*

Route: `app/driver/trip`

The trip screen is the driver’s navigation and progression workspace for an accepted, picked-up, or in-progress booking.

**Interface Components:**
- Tracking map with pickup, destination, driver, and passenger markers
- Passenger name and contact information
- Status timeline
- Fare and payment summary

**Trip Progression Actions:**
- **Confirm Pickup** — status changes to Picked Up
- **Start Trip** — status changes to In Progress
- **Complete Trip** — an Earning record is created; status becomes Completed
- **Cancel** — available according to the same server-side booking guards used by the web app

When no trip is active, an empty state tells the driver to accept a request first.

---

#### Driver Earnings Interface

**Figure 13. Driver Earnings Interface**

*[Insert screenshot of the earnings screen here]*

Route: `app/driver/earnings`

The earnings screen provides a financial summary for the logged-in driver. Amounts reflect the full base trip fare. The 15% platform fee is collected from the passenger total and is not deducted from the driver’s recorded earning.

**Summary Cards:**
- Total earnings
- Period summaries (as returned by the earnings API)
- Completed trip count
- Per-trip earning history

---

#### Driver Profile Interface

**Figure 14. Driver Profile Interface**

*[Insert screenshot of the driver profile screen here]*

Route: `app/driver/profile`

The driver profile screen displays account and vehicle information, verification status, and profile image.

**Profile Information Displayed:**
- Profile image
- Full name and driver status badge
- Email, phone
- Vehicle type, plate number, and model
- Sign out control

---

### Administrative Module

The mobile admin module is a deliberately reduced, phone-appropriate subset of the web admin. Fare/zone editing, full analytics reports, passenger directory management, remittance management, and system settings stay on the web application.

#### Admin Dashboard

**Figure 15. Admin Dashboard Interface**

*[Insert screenshot of the admin dashboard here]*

Route: `app/admin/index`

The administrator dashboard provides an operational overview that can be checked from a phone.

**Summary Tiles:**
- Total bookings
- Completed, pending, and cancelled bookings
- Active drivers
- Total drivers and total passengers
- Platform revenue

Shortcut buttons open Bookings, Drivers (KYC approval), SOS & Disputes, and Profile. A short notice reminds the administrator that fare rates, full reports, and remittances remain web-only.

---

#### Admin Booking Monitoring Interface

**Figure 16. Admin Bookings Interface**

*[Insert screenshot of the admin bookings screen here]*

Route: `app/admin/bookings`

The bookings screen displays bookings across statuses so administrators can review transportation activity away from a desktop.

**Booking Card Information:**
- Status badge
- Passenger and driver names
- Pickup and drop-off addresses
- Fare and payment method / payment status
- Date and time
- Status filter controls

---

#### Admin Driver Management Interface

**Figure 17. Admin Driver Management Interface**

*[Insert screenshot of the admin drivers screen here]*

Route: `app/admin/drivers`

The driver management screen allows administrators to review registrations and change verification status from the phone.

**Driver Information:**
- Name, contact details
- Vehicle type, plate, model
- License number
- Verification status (Pending / Verified / Suspended)
- Document photos for KYC review

**Verification Actions:**
- **Approve / Verify** — driver can go online and accept bookings
- **Suspend** — driver cannot accept new bookings
- **Re-verify** — restores a suspended driver

---

#### Admin SOS and Disputes Interface

**Figure 18. Admin SOS and Disputes Interface**

*[Insert screenshot of the admin SOS and disputes screen here]*

Route: `app/admin/sos`

This screen combines two time-sensitive admin tasks that belong on a phone.

**SOS Alerts:**
- Status (Active / Resolved)
- Passenger identity
- GPS coordinates, with an option to open the location in an external maps app
- Optional passenger message and timestamp
- **Mark Resolved**

**GCash Disputes:**
- Bookings with dispute status Requested
- **Approve** or **Deny** the dispute

---

### Evaluation of the System

The system is designed to be evaluated using the ISO/IEC 9126 software quality model, measuring functionality, efficiency, usability, reliability, maintainability, and portability. Evaluation should be conducted using a 5-point Likert scale administered to selected evaluators including passengers, drivers, administrators, and IT faculty or community members of Socorro, Surigao del Norte.

**Likert scale:** 5 = Strongly Agree, 4 = Agree, 3 = Neutral, 2 = Disagree, 1 = Strongly Disagree.

**Verbal interpretation of means:** 4.51–5.00 Strongly Agree; 3.51–4.50 Agree; 2.51–3.50 Neutral; 1.51–2.50 Disagree; 1.00–1.50 Strongly Disagree.

> Complete the Mean and Verbal Description columns after the mobile-app evaluator survey is administered. Do not reuse the web-application survey scores without a new instrument that names the Android app.

#### A. FUNCTIONALITY

| Criteria | Mean | Verbal Description |
|---|---|---|
| The mobile app allows passengers to register, upload photos, and book rides successfully | | |
| The app accurately shows fare estimates (trip fare, platform fee, and total) | | |
| GPS and the map correctly support pickup, drop-off, and live tracking | | |
| Driver online/offline, request accept, and trip progression function correctly | | |
| Admin KYC approval, SOS handling, and dispute actions operate as expected | | |
| Cash and GCash (test) payment flows complete and return to the app | | |
| **Average Mean** | | |

**Justification:** Role-based navigators, server-side booking guards, device GPS, Google Maps, PayMongo checkout with deep-link return, and admin oversight screens implement the intended community transportation functions on Android.

#### B. EFFICIENCY

| Criteria | Mean | Verbal Description |
|---|---|---|
| Ride booking requests are processed and appear for drivers quickly | | |
| Home, map, and list screens load without noticeable delay | | |
| GPS location capture and map updates respond within acceptable time | | |
| Trip history and earnings summaries generate without delay | | |
| **Average Mean** | | |

**Justification:** Thin API modules, polling limited to screens that need live data, and a shared indexed PostgreSQL backend support responsive performance on a phone.

#### C. USABILITY

| Criteria | Mean | Verbal Description |
|---|---|---|
| The app is easy to learn and use for first-time passengers | | |
| Bottom tabs and admin stack navigation are clear for each role | | |
| Booking forms, map controls, and error alerts are easy to understand | | |
| The interface fits a phone screen and one-handed use while traveling | | |
| Role-specific menus reduce confusion between user types | | |
| **Average Mean** | | |

**Justification:** Native components, a shared color theme, tab navigation for daily passenger and driver tasks, and a reduced admin stack simplify onboarding compared with a desktop sidebar used on a small browser.

#### D. RELIABILITY

| Criteria | Mean | Verbal Description |
|---|---|---|
| The app behaves consistently across repeated booking operations | | |
| Booking status transitions are accurately reflected for all roles | | |
| Earnings and trip records remain accurate after multiple operations | | |
| Error messages clearly guide users when the network or GPS fails | | |
| **Average Mean** | | |

**Justification:** TypeScript types, server-side Zod validation, Prisma constraints, and a single backend for web and mobile keep booking state consistent even when two clients are used.

#### E. MAINTAINABILITY

| Criteria | Mean | Verbal Description |
|---|---|---|
| The mobile codebase is modularly organized and understandable | | |
| Shared fare and vehicle-type rules are copied from the source of truth rather than reinvented | | |
| New screens can be added in Expo Router without rewriting the backend | | |
| **Average Mean** | | |

**Justification:** Route groups, one API module per resource, mirrored `src/lib` files, and additive backend changes (JWT auth, push token, payment bridge) keep the mobile client maintainable.

#### F. PORTABILITY

| Criteria | Mean | Verbal Description |
|---|---|---|
| The app installs and runs on standard Android phones | | |
| The app can be built as an APK through EAS without a local Android SDK | | |
| The app works when pointed at a reachable backend (LAN or deployed host) | | |
| **Average Mean** | | |

**Justification:** Expo and EAS Build produce a standalone Android APK. Environment variables configure the API base URL and Maps key. iOS is technically possible with Expo but is outside this study’s scope.

#### System Evaluation Summary

| System Evaluation Criteria | Mean | Verbal Description |
|---|---|---|
| Functionality | | |
| Efficiency | | |
| Usability | | |
| Reliability | | |
| Maintainability | | |
| Portability | | |
| **Grand Mean** | | |

---

### Key Achievements

Pasakja addresses the limitations of manual, informal community transportation practices and of a web-only booking workflow:

**1. Accessibility and Convenience**
- Passengers book rides from an Android phone without going to a physical terminal or opening a desktop browser
- GPS and map taps reduce the need to type addresses
- Camera capture makes KYC possible without a scanner or PDF
- Cash and GCash accommodate different passenger preferences

**2. Accountability and Transparency**
- Ratings promote consistent service quality from drivers
- Full trip history is accessible in the app
- Driver verification ensures only approved drivers operate on the platform
- Fare breakdown shows trip fare, platform fee, and total
- Passengers and drivers can confirm identity during an active trip

**3. Operational Efficiency**
- Automated fare computation reduces fare disputes
- Drivers see requests on a dedicated tab and can accept with one action
- Trip progression (Accept → Pickup → Start → Complete) is recorded on the server
- Push notifications reduce the need to keep a screen open
- Nearby-driver markers and optional preferred-driver requests speed dispatch

**4. Safety and Emergency Response**
- SOS with GPS is always on the passenger tab bar
- Admin SOS handling is available on the phone
- Local emergency numbers are listed beside the in-app alert
- Driver document review reduces passenger safety risks

**5. Administrative Control on the Go**
- Dashboard stats, bookings, KYC, SOS, and disputes can be handled from a phone
- Desk-bound configuration stays on the web, avoiding a cramped mobile settings experience

---

### System Advantages

**Modern Mobile Stack**
- Expo and React Native — native Android UI with a single TypeScript codebase
- Expo Router — file-based, role-grouped navigation
- Google Maps — booking and live tracking
- Expo Location, Notifications, Secure Store, Image Picker, Web Browser, Linking
- Shared Next.js + PostgreSQL backend — one source of truth with the web app
- PayMongo — Philippine GCash checkout with a mobile return bridge

**Scalability**
- Thin client: new web booking rules apply to mobile without rewriting fare math
- Normalized relational schema shared with the web platform
- Role-group routing supports adding screens without mixing passenger and driver UI
- Push tokens stored per user for targeted notifications

**Developer Experience**
- Clear separation: `app/` routes, `src/api/` HTTP, `src/components/` UI, `src/lib/` mirrored rules
- EAS Build for APK production without a local Android SDK
- Expo Go for fast UI iteration (except push and custom scheme)

---

### Comparison with Traditional Methods

| Traditional Method | Pasakja Mobile App | Improvement |
|---|---|---|
| Flagging down tricycles / habal-habal / bao-bao | GPS map booking on Android | Instant booking from the roadside |
| Uncertain waiting time with no information | Live trip map, status timeline, and push notifications | Transparency and less anxiety |
| Verbal fare negotiation | Automated fare with visible platform fee | Standardized, dispute-free pricing |
| Cash-only transactions | Cash and GCash via PayMongo | Flexible payment |
| No driver accountability record | Ratings, KYC photos, and trip history | Measurable service quality |
| Manual dispatching or texting a known driver | Nearby drivers, optional preferred driver, request inbox | Faster, organized dispatch |
| No emergency protocol | SOS with GPS plus local hotlines | Immediate admin and community response |
| Paper or memory-based trip records | Digital history on the phone | Searchable, persistent records |
| No income tracking for drivers | Earnings screen | Drivers can monitor income |
| No passenger identity check | Photo document upload | Safer onboarding |
| Driver fee taken from earnings | Platform fee added to passenger total | Fairer driver income |
| Guesswork on travel time | OSRM duration and distance | Better trip planning |
| Opening a website while standing or driving | Native tabs and large trip/SOS controls | Practical to use on a phone |

---

### Limitations and Future Enhancements

While the system meets its capstone objectives, the following enhancements are identified for future development:

1. **Production Payment Gateway** — Connect a verified PayMongo merchant account for live GCash transactions beyond test mode.
2. **Background Location** — Add Android background location (with the required Play policy disclosures) so drivers can remain visible when the app is not in the foreground.
3. **iOS Application** — Build the same Expo project for iPhone once Apple Developer enrollment and Maps keys are available.
4. **Turn-by-Turn Navigation** — Extend routing beyond distance, duration, and map markers to step-by-step directions for drivers.
5. **Hosted OSRM Instance** — Replace the public demo router with a self-hosted server for production reliability.
6. **Passenger Verification Status** — Add a formal Pending / Verified badge for passengers, similar to drivers.
7. **Shared Ride Matching** — Automatically match compatible bookings traveling similar routes, beyond the current shared-ride flag.
8. **Richer Admin on Mobile or Tablet** — Optionally bring fare/zone editing or simplified reports to a larger device.
9. **SMS Fallback** — Add SMS for users who disable push notifications.
10. **Periodic Security Audits** — Schedule reviews as user volume grows.
11. **ISO 9126 Field Evaluation** — Administer the instrument in this chapter to passengers, drivers, and administrators in Socorro and record the means in the evaluation tables.

---

### Conclusion of Chapter 5

The implementation demonstrates that Pasakja: A Mobile App Community Transportation Booking & Dispatching System can digitize the transportation booking lifecycle on Android — from registration and KYC photos, to map booking and GCash return, to driver dispatch and trip completion, to SOS and dispute handling. GPS-based booking, automated fare computation, cashless payment, push notifications, and role-based mobile navigation collectively turn an informal, manual system into an organized, accountable, phone-first community transportation platform.

**Overall Assessment:**
- **System Status:** Functional for community pilot use on Android when pointed at a reachable Pasakja backend
- **System Version:** v1.0.0
- **ISO 9126 Grand Mean:** *to be completed after the evaluator survey*

Key strengths include native map booking, live tracking, PayMongo GCash with deep-link return, driver verification by camera, SOS, push notifications, and a shared backend that keeps the web and mobile clients consistent.

The project demonstrates successful application of Expo, React Native, TypeScript, Google Maps, and a dual-client authentication design to solve a real community transportation problem within the capstone scope.

---

# CHAPTER 6

# SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS

### 6.1 Summary

Pasakja was designed and implemented as a mobile application for community transportation booking and dispatching in Socorro, Surigao del Norte. The developed system operationalizes core transportation management functions for three distinct user roles — passengers, drivers, and administrators — using a native Android client and a shared role-based backend. The system addresses common community transportation problems including inefficient manual booking, unclear fare structures, unorganized dispatching, lack of real-time transparency, and the difficulty of using a website while traveling.

The mobile application was developed using Expo (React Native), Expo Router, TypeScript, Google Maps, Expo Location, Expo Notifications, Expo Secure Store, Expo Image Picker, Expo Web Browser, and Expo Linking. It authenticates with a Bearer JWT and consumes the existing Pasakja Next.js API, PostgreSQL database, Cloudinary media storage, PayMongo GCash checkout, and OSRM route estimates. The only additive database field required for mobile is `User.pushToken`. Admin work that belongs at a desk remains on the web application.

### 6.2 Conclusions

Based on the implemented modules and evaluated workflows, the study concludes that:

1. A native Android application can effectively digitize local ride booking and dispatching, eliminating the need for manual, in-person coordination between passengers and drivers.
2. Role-specific mobile navigators for passengers, drivers, and administrators improve coordination, reduce confusion, and keep each user type on the tools that fit a phone.
3. Centralized booking records, trip status tracking, and a shared backend with the web platform improve operational transparency and keep fares, payments, and statuses consistent across clients.
4. Safety and accountability are strengthened through camera-based driver (and optional passenger) verification, trip history, ratings, live maps, SOS alerts, and push notifications.
5. Device GPS, automated fare computation with a transparent platform fee, and GCash integration improve the ride experience and bring community transportation closer to the standards set by nationally recognized mobile platforms such as Grab, Joyride, and Angkas — while remaining scoped to Socorro’s tricycle, habal-habal, and bao-bao operators.
6. Adding the platform fee to the passenger total — rather than deducting it from driver earnings — supports a fairer revenue model on both the web and mobile clients.
7. The solution is suitable as a practical capstone output and a deployable foundation for community transportation modernization in Socorro, Surigao del Norte, provided the Android app is pointed at a reachable backend and evaluated with the ISO 9126 instrument in Chapter 5.

### 6.3 Recommendations

For further development and institutional deployment, the following enhancements are recommended:

- **Pilot Deployment:** Conduct a pilot in the Socorro community with a measured usability and satisfaction evaluation using ISO 9126 criteria, then encode the means in Chapter 5.
- **Production Payment Gateway:** Connect a verified PayMongo merchant account to enable live GCash transactions.
- **Background Location and iOS:** Extend location to background (with policy-compliant disclosures) and ship an iOS build from the same Expo project.
- **Turn-by-Turn Navigation:** Add step-by-step directions for drivers on top of the existing map and OSRM estimates.
- **Hosted Routing:** Replace the public OSRM demo endpoint with a self-hosted instance.
- **Formal Passenger Verification:** Let administrators approve passenger documents with a visible badge.
- **Periodic Security Audits:** Review token handling, upload limits, and API authorization as usage grows.
- **Expanded Transport Options:** Support additional operators within the broader Surigao del Norte region once the Socorro pilot is stable.

---

## REFERENCES

AbdelAziz, A., Alarabi, L., Basalamah, S., & Hendawi, A. (2019). *Trans-Sense: Real time transportation schedule estimation using smart phones*. arXiv.  
https://arxiv.org/abs/1906.07575

Adekola, O. D., Adekunle, Y. A., & Bello, O. (2021). An online road transport booking system. *African Journal of Computing & ICT*.  
https://ajcst.co/index.php/ajcst/article/view/2913

Angkas, Inc. (2023). *Angkas: The first LTFRB-regulated motorcycle taxi ride-hailing platform in the Philippines*.  
https://angkas.com

Barrera Hernandez, J. E., Moctezuma Olvera, M. A., García Macías, J. A., & Ramírez Sámano, M. A. (2025). Optimization of bus dispatching in public transportation through a heuristic approach based on passenger demand forecasting. *Smart Cities, 8*(3), 87.  
https://www.mdpi.com/2624-6511/8/3/87

Cramer, J., & Krueger, A. B. (2016). Disruptive change in the taxi business: The case of Uber. *American Economic Review, 106*(5), 177–182.  
https://doi.org/10.1257/aer.p20161002

Dexter. (2025). *STCS capstone projects. NavRide: Web-based vehicle booking system*.  
https://fliphtml5.com/zooax/myaf/STCS_CAPSTONE_PROJECTS/

Estrada-Esquivel, H., Pozos-Parra, M. P., Linares-Flores, A., Cuevas-Tello, J. C., & Molina-Macías, A. (2022). A smart information system for passengers of urban transport based on IoT. *Electronics, 11*(5), 834.  
https://www.mdpi.com/2079-9292/11/5/834

Expo. (2025). *Expo documentation* (SDK 57).  
https://docs.expo.dev/versions/v57.0.0/

Grab Holdings Inc. (2023). *Grab: Southeast Asia’s leading superapp — transportation, delivery, and financial services across eight countries*.  
https://grab.com

Iliopoulou, C., & Kepaptsoglou, K. (2019). Combining ITS and optimization in public transportation planning: State of the art and future research paths. *European Transport Research Review, 11*, 27.  
https://link.springer.com/article/10.1186/s12544-019-0365-5

Joyride Group, Inc. (2022). *Joyride: Revolutionizing last-mile transportation in the Philippines through motorcycle taxi and tricycle ride-hailing services*.  
https://joyridegroup.com

Meta Platforms, Inc. (2025). *React Native documentation*.  
https://reactnative.dev

Pizarro, J. B., Gumabay, M. V. N., & Gumarang, S. G. (2025). TC-TRISSEA (Tuguegarao City Tricycle Riders Information, Security and Satisfaction Enhancement App) — A proposed mobile app for tricycle commuters of Tuguegarao City. *International Journal of Innovative Technology and Exploring Engineering*.  
https://www.researchgate.net/publication/392235358

Ulay, D. A. L. L., Domingo, A. D. D., Beran, C. J. A., Lazarte, A. L. S., et al. (2025). GTRIKE: Internet-based mobile application for tricycle reservation in San Jose, Occidental Mindoro. *International Journal of Research Studies in Educational Technology*.  
https://consortiacademia.org/wp-content/uploads/2024/e9i01/E25012_final.pdf

---

## APPENDIX

### Appendix A. User Interface Screenshots

Insert device screenshots for Figures 1–18 in the order listed in the List of Figures. Capture each screen on an Android phone (Expo Go or a built APK) while signed in as the matching role.

### Appendix B. Demo Credentials

The shared backend seed (`npm run db:seed` in the Pasakja web repository) creates the following accounts for demonstration. Public registration in the mobile app creates only Passenger or Driver accounts.

| Role | Email | Password |
|---|---|---|
| Administrator | admin@demo.com | demo123 |
| Driver | driver@demo.com | demo123 |
| Passenger | passenger@demo.com | demo123 |

Newly registered drivers remain PENDING until an administrator approves them in Admin → Drivers.

### Appendix C. Runtime Configuration

The mobile application requires:

- `API_BASE_URL` — the Pasakja backend URL reachable from the phone (never `localhost` on a physical device)
- `GOOGLE_MAPS_API_KEY_ANDROID` — Maps SDK for Android, package `com.pasakja.mobile`

Push notifications additionally require an Expo/EAS project ID and Firebase Cloud Messaging credentials. GCash demonstration uses the backend’s PayMongo test keys; PayMongo’s test checkout provides Authorize / Fail buttons and does not need a real GCash account.

### Appendix D. Known Scope Decisions

These are intentional limitations, not defects:

- Foreground GPS only
- Admin fare/zone, full reports, and remittances are web-only
- KYC on mobile is photo-only
- OSRM uses a public demo server
- GCash minimum charge is ₱20
- Push notifications work on a built APK, not in Expo Go

---

## CURRICULUM VITAE

### Personal Information

**Name:** Judy-Ann Portillano Puno  
**Nickname:** Juda  
**Age:** 21 yrs old  
**Date of Birth:** January 20, 2005  
**Civil Status:** Single  
**Religion:** Born Again Christian  
**Place of Birth:** Socorro, Surigao Del Norte  
**Home address:** Brgy. Albino Taruc, Socorro, Surigao Del Norte  
**Email address:** punojudyann43@gmail.com  
**Contact Number:** 09951542637

### Educational Background

**Elementary:** Don Albino Taruc Memorial Elementary School (DATMES)  
**High School:** Socorro National High School (SONHS)  
**Senior High School:** Bucas Grande Foundation College – Senior High School (BGFC)  
**Tertiary:** Bucas Grande Foundation College (BGFC)

---

### Personal Information

**Name:** Daphnie Dane Velez Supero  
**Nickname:** Daphnie  
**Age:** 21 yrs. old  
**Date of Birth:** August 12, 2004  
**Civil Status:** Single  
**Religion:** INC  
**Place of Birth:** Surigao City, Surigao Del Norte  
**Home address:** Brgy. Sta. Cruz, Socorro, Surigao Del Norte  
**Email address:** daphniesupero@gmail.com  
**Contact Number:** 09460589983

### Educational Background

**Elementary:** Mariano Espina Memorial Central Elementary School  
**High School:** Taft National High School  
**Senior High School:** Bucas Grande Foundation College – Senior High School (BGFC)  
**Tertiary:** Bucas Grande Foundation College (BGFC)

---

### Personal Information

**Name:** Leerose Taro Guma  
**Nickname:** Leerose  
**Age:** 21 yrs old  
**Date of Birth:** January 3, 2005  
**Civil Status:** Single  
**Religion:** IFI  
**Place of Birth:** Socorro, Surigao Del Norte  
**Home address:** Brgy. Navarro, Socorro, Surigao Del Norte  
**Email address:** roseguma03@gmail.com  
**Contact Number:** 09762654481

### Educational Background

**Elementary:** Don Albino Taruc Memorial Elementary School (DATMES)  
**High School:** Socorro National High School (SONHS)  
**Senior High School:** Socorro National High School (SONHS)  
**Tertiary:** Bucas Grande Foundation College (BGFC)

---

*End of Document*
