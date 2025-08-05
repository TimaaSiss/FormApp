FIX

1 - Added scripts (db:push => migration, db:seed => seed initial user; db:studio => voir la base de donne dans le navigateur);
2 - Added .env.sample in the root folder to reproduce easily the deployment of the app;

TODO

1 - Redirect automatically to the form page;
2 - Use tanstack-query in relations with server action instead of creating and apis to fetch the data;
3 - Add an information page to show the form response in the dashboard;
4 - Reset the form once the user finish to awnser all the questions;
5 - Use zustand to persist the anwsers so the can comeback at any time or lose the network connection;
6 - Add an email functionnality (react-emails / smtp / nodemailer) to send reply to the user after finishing the form;
