# Learning Web Frontend

This is a Next.js project integrated with Tailwind CSS and Redux for state management, designed to work with an existing backend.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd learning-web-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## Project Structure

- **src/app**: Contains the main application layout and pages.
- **src/components**: Reusable UI components.
- **src/features**: Redux store and slices for state management.
- **src/hooks**: Custom React hooks for reusable logic.
- **src/services**: API service for backend interactions.
- **src/types**: TypeScript types and interfaces.

## Tailwind CSS

This project uses Tailwind CSS for styling. You can customize the styles in the `tailwind.config.js` file.

## Redux

The project is set up with Redux for state management. The store is configured in `src/features/store.ts`.

## API Integration

The application interacts with the backend API. You can find the API service functions in `src/services/api.ts`.

## Learn More

To learn more about Next.js, Tailwind CSS, and Redux, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Redux Documentation](https://redux.js.org/introduction/getting-started)

## License

This project is licensed under the MIT License.