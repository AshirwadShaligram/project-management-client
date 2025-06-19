"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CameraIcon, Edit, User, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserProfile, getUserProfile } from "@/redux/slice/authSlice";
import { toast } from "sonner";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  // Fetch user profile on mount
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateUserProfile(editedUser)).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedUser({
          ...editedUser,
          avatar: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !user) {
    return <div className="p-4">Loading user data...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <Avatar className="h-28 w-28">
                <AvatarImage
                  src={editedUser.avatar || "/placeholder-avatar.jpg"}
                />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-secondary flex items-center justify-center cursor-pointer"
                  >
                    <CameraIcon className="h-4 w-4" />
                  </label>
                </>
              )}
            </div>

            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>

            <Separator className="my-6" />

            <div className="w-full">
              <p className="flex justify-between py-2">
                <span className="text-muted-foreground">Role</span>
                <span className="capitalize">{user?.role}</span>
              </p>
            </div>

            <Button
              className="mt-6 w-full"
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>
              Update your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={editedUser.email}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  disabled={!isEditing}
                  type="email"
                />
              </div>

              {isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, password: e.target.value })
                    }
                  />
                </div>
              )}

              {isEditing && (
                <Button
                  onClick={handleSaveProfile}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
