import User from "@/models/User";

export async function seedAdmin() {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;

  try {
    const existingUser = await User.findOne({ email: adminEmail, role: "admin" });

    if (!existingUser) {
      console.log("Seeding admin user...");
      const user = await User.create({
        name: adminName,
        email: adminEmail,
        role: "admin",
        image: "",
        provider: "email"
      });
      await user.save();
      console.log("Admin user seeded successfully.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}
