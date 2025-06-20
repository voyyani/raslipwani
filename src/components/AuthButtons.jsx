import React from 'react';
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
const AuthButtons = () => {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary transition-colors">
            Admin Login
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
        <Link 
          to="/admin" 
          className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary transition-colors"
        >
          Dashboard
        </Link>
      </SignedIn>
    </div>
  );
};

export default AuthButtons;