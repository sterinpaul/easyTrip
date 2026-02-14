import User from "@/models/User";

export async function seedAdmin() {
  const adminEmail = "[EMAIL_ADDRESS]";
  
  try {
    const existingUser = await User.findOne({ email: adminEmail });
    
    if (!existingUser) {
      console.log("Seeding admin user...");
      await User.create({
        name: "Sterin Paul",
        email: adminEmail,
        role: "admin",
        image: "", // Optional: can be filled later or on first login
        provider: "email"
      });
      console.log("Admin user seeded successfully.");
    } else {
        // Ensure role is admin if it exists
        if (existingUser.role !== "admin") {
            existingUser.role = "admin";
            await existingUser.save();
            console.log("Updated existing user to admin role.");
        }
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}
