"use client"

import { useRef } from "react"
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export function AuthPage({ isSignin }: {
  isSignin: boolean
}) {

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleAuth = async () => {
    console.log("Button clicked!");
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const name = nameRef.current?.value || "";

    if (!email || !password || (!isSignin && !name)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const endpoint = isSignin ? "/signin" : "/signup";

      // For signin, backend expects 'username' field
      // For signup, backend expects 'email' field
      const payload: any = isSignin
        ? { email, password }  // signin uses username
        : { email, password, name };     // signup uses email

      console.log("Sending payload:", payload);
      const response = await axios.post(`${HTTP_BACKEND}${endpoint}`, payload);
      console.log("Response:", response.data);

      if (isSignin && response.data.token) {
        localStorage.setItem("token", response.data.token);
        alert("You have signed in successfully!");
        // Redirect to canvas or dashboard
        window.location.href = "/dashboard"; // You might want to create a proper room first
      } else if (!isSignin) {
        alert("Signup successful! Please sign in.");
        // Redirect to signin page
        window.location.href = "/signin";
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Network error. Please try again.");
      }
    }
  };
  //suhaib123456   suhain123@gmail.com

  return <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
    <div className="p-8 m-2 bg-white rounded-lg shadow-lg border border-gray-200">

      <div className="p-2">
        <input
          ref={emailRef}
          type="text"
          placeholder="Email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-gray-900"
        />
      </div>

      <div className="p-2">
        <input
          ref={passwordRef}
          type="text"
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-gray-900"
        />
      </div>
      {!isSignin && (
        <div className="p-2">
          <input
            ref={nameRef}
            type="text"
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 text-gray-900"
          />
        </div>
      )}

      <div className="pt-4">
        <button
          type="button"
          onClick={handleAuth}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-md font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          {isSignin ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  </div>
}