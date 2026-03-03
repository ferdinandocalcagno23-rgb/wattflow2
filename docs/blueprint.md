# **App Name**: WattFlow

## Core Features:

- Bluetooth Device Connection (Trainer & HR): Establish and maintain robust connections with Smart Trainers (FTMS) and Heart Rate Monitors (HRM) using the Web Bluetooth API.
- Global Data & Control Store: Centralized state management (e.g., Zustand) for live sensor data (Power, Cadence, HR) and essential methods to control trainer parameters globally.
- ERG Mode for Targeted Power: A dedicated interface to display current and target power in large, prominent numbers, with quick buttons to dynamically adjust target power for consistent wattage training.
- Resistance Mode for Free Riding: An intuitive slider interface to manually control trainer resistance (levels 1-10 or 0-100%), allowing the user to manage intensity via their bike's gears while live metrics are displayed.
- Workout Editor with FTP Zones: An input field for the user's Functional Threshold Power (FTP) that automatically calculates and displays power training zones (Coggan/Friel). A visual builder then allows creating structured interval workouts using colored zone blocks, with options to reorder and adjust block durations.
- AI-Powered Workout Suggestions: An intelligent tool within the Workout Editor that suggests dynamic workout block sequences tailored to user-defined goals (e.g., 'build endurance', 'improve VO2 max') and available training time, using its reasoning to provide relevant structured plans.
- Interactive Workout Player: Executes custom or AI-generated workouts, displays real-time block countdown timers, automatically adjusts trainer resistance according to the workout profile, and visualizes power output on an interactive Recharts graph.

## Style Guidelines:

- Color scheme: Dark mode, chosen to enhance focus during intense training sessions and reduce screen glare. This provides a sleek, high-performance aesthetic.
- Primary color: Energetic Deep Violet (#8B32DB). This hue represents digital flow and power, providing a vibrant accent against the darker background without being overly distracting.
- Background color: Subtle Muted Plum (#261F2B). This dark, desaturated background maintains visual continuity with the primary color, creating a cohesive and calming visual base.
- Accent color: Bold Electric Blue (#3F3FFF). Positioned approximately 30 degrees from the primary hue on the color wheel, this vibrant blue ensures excellent contrast for interactive elements and key data points.
- Headline and large numbers font: 'Space Grotesk' (sans-serif), for its computerized and modern aesthetic, fitting the high-tech nature of the app. Body text font: 'Inter' (sans-serif), for excellent readability and a neutral, objective feel.
- Icons: Use 'lucide-react' to provide a consistent set of clear, modern, and performance-oriented line icons throughout the application.
- Responsive design with a mobile-first approach. Emphasize clean, data-driven layouts for ERG and Resistance modes, featuring large, easy-to-read numbers. The Workout Editor will utilize intuitive, visual components for building workout blocks, while the Player integrates chart visualizations and clear progress indicators.
- Animations: Implement smooth and subtle transitions for page navigation and mode switching. Provide haptic or visual feedback for interactive elements like power adjustment buttons. Real-time metrics and chart updates will animate smoothly to enhance user engagement.