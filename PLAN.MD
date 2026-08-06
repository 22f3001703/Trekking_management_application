Trekking Management Application - V2
Adventure organizations require efficient systems to manage trekking activities involving trek organizers, staff, and participants. Currently, many trekking groups rely on spreadsheets, calls, or manual coordination, which makes it difficult to manage trek approvals, participant registrations, slot availability, and booking tracking.

You are required to build a Trekking Management Application (TMA) web application that allows Admin, Trek Staff, and Users (Trekkers) to interact with the system based on their roles.

Frameworks to be used
These are the mandatory frameworks on which the project has to be built.

Flask for API
VueJS for UI
VueJS Advanced with CLI (only if required, not necessary)
Jinja2 templates if using CDN only for entry point (not to be used for UI)
Bootstrap for HTML generation and styling (no other CSS framework is allowed)
SQLite for database (no other database is permitted)
Redis for caching
Redis and Celery for batch jobs
Note:

All demos should be possible on your local machine.
Any other framework/library will not be allowed apart from those given above.
The database must be created programmatically (via table creation or model code)
Manual database creation  (e.g., DB Browser for SQLite) is NOT allowed.

Roles & Functionalities
This platform has three roles:

Admin
Admin is the pre-existing superuser of the application.

Can create, update and remove trekking routes
Can add and manage trek staff
Can assign staff to treks
Can view and manage all users, staff, and treks
Can search users, staff, or treks
Can deactivate or blacklist users or staff
Can view reports and trekking statistics.

Trek Staff

Can log in only after being created by Admin
Can view assigned treks by admin
Can manage trek details such as:
Available slots
Trek status (Open / Closed)
Can view list of registered users for their treks
Can update trek completion status

User (Trekker)

Can register, log in, and update their profile
Can view approved/open treks
Can search and filter treks based on difficulty, location, and duration
Can book treks
Can view booking status and trekking history

Key Terminologies
Admin: A user with the highest level of access who manages the entire trekking system.
Trek Staff: A staff member responsible for managing and coordinating assigned treks.
User (Trekker): A participant who books and participates in trekking activities.
Trek: A trekking event created and managed in the system.
Attributes: 

Trek ID
Trek Name
Location
Difficulty (Easy / Moderate / Hard)
Duration (in days)
Available Slots
Assigned Staff ID
Status (Pending / Approved / Open / Closed / Completed)
Start Date
End Date
Extra fields etc.

Booking: A record of a user booking a trek.
Attributes:

Booking ID
User ID
Trek ID
Booking Date
Status (Booked / Cancelled / Completed)
Payment Status (Optional)
Extra fields etc.

Staff Profile: Details of a registered staff member.
Attributes:

Staff ID
Name
Contact Details
Assigned Trek(s)
Status
Extra fields etc.

Note: The above tables and fields are not exhaustive. Students can add more/less tables and fields as required.


Similar Apps
https://www.alltrails.com/
https://www.thrillophilia.com/
https://www.meetup.com/

Application Wireframe
mad2-trekking-wireframe.pdf

Note:
The provided wireframe is intended only to illustrate the application's flow and demonstrate navigation.

Replication of exact UI is NOT mandatory.
Students are encouraged to design their own UI while maintaining the application's intended functionality and flow.

Core Features
Authentication  
Login/register for Users (Trekker)
Login only for Admin and Trek Staff (no registration)
Only one Admin must exist and should be created programmatically
Role-based access control and authentication using Flask security (session or token) or JWT based Token.
A unified user model to differentiate all types of user roles.

Admin Functionalities

Admin dashboard showing:
Total number of treks
Total number of users and staffs
Total number of bookings
Admin must pre-exist and be created programmatically after database creation. [No admin registration allowed]
Admin can:
Create and manage treks routes
Add a new trek staff
Assign staff to treks
View all bookings
Search users, staff, and treks
Deactivate or blacklist users/staff

Trek Staff Functionalities

Staff dashboard should display:
Assigned treks by admin
Number of registered user per trek
Staff can:
Update trek slots and status
View and manage participant list
Mark trek as started/completed

User Functionalities

Users must self-register and log in
User dashboard should display:
Available treks
Booked treks
Trek status
Users can:
Book treks
View booking status
View trekking history
Edit their profile
Search treks

Backend Jobs (Using Celery)
a. Scheduled Job – Daily Reminders - The application should send daily reminders to users on g-chat using Google Chat Webhooks or SMS or mail

Send reminders to users about upcoming treks, including trek start date, instructions, etc.
Can be sent via email, SMS, or webhook
Runs daily at a chosen time

b. Scheduled Job – Monthly Activity Report - Devise a monthly report for the Admin created using HTML and sent via mail.

Generate monthly trekking activity report for Admin
Includes:
Number of treks conducted
Number of users participated
Popular treks
Generated on the first day of every month
Sent to Admin via email (HTML or PDF)
c. User Triggered Async Job – Export Booking History as CSV

Users can export their trekking history
CSV should include:
User ID
Trek Name
Location
Booking Status
Dates
Triggered from user dashboard
Export is triggered from the student dashboard.
This should trigger a batch job, and send an alert once done.

Performance and Caching

Use Redis caching for:
Frequently accessed treks
Implement cache expiry
Optimize API response times

Other Core Functionalities

Prevent overbooking beyond available slots
Ensure only assigned staff can manage a trek
Allow booking only when trek status is Open
Prevent duplicate bookings for same trek
Maintain complete trekking history per user
Allow searching and filtering of treks
Allow admin to view all historical trekking data