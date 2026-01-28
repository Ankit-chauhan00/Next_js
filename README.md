CHAPTER - 6 (File Based Routing)

CHAPTER - 7 (Architectue)

1.) Birth of Server Components
2.)Client vs Server Paradigm
3.)Architecture Rendering Strategies

CHAPTER - 8 (Light and Dark Theme)

1.) use npm install next-themes
2.)Create the context outside the app Router
3.)wrap the children in Layout .tsx with the theme context Provider

CHAPTER - 9(Authorization and authentication)

1.)Creating the Routs and layout for sign-in and signUp
2.)crating the Sign ina d sign up pages
3.)Auth js setup first with github --> setting --> developre tools --> Auth Setupp
4.)for toast message from shadcn to use the toast component use command --> npx shadcn@latest add sonner  instead of npx shadcn@latest add toast it will be added in components --> UI sooner
5.)now we have created the routes folder inside the constants --> routes this is because to redirect to the particular route without a type mistake
6.)Now we have to createte the signi inthe SocialForm.tsx where in horm handler we ahve implemented whole github 
7.)wrap-up the app root layout with session Provider

(HOW TO GET GOOGLE AUTH SECTET AND ID)

1:) GO-TO :- https://console.cloud.google.com/
2:) Create new Project and co to oAuth section
3:) in APi and keys section you got credential there you have to click get started and go with the requirements
4:) main purpose is to getting the auth-secret key and Auth-Id

(Creating Auth Form)
1.) npx shadcn@latest add form (the components will be added in components-->ui)