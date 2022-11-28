import React from "react";

export const LoggingIn: React.FC = () => {
  return (
    <div className="flex h-[100vh] w-[100vw] items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div>Please wait while you log in...</div>
      </div>
    </div>
  );
};
