import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const query = { _id: resolvedParams.id, isActive: true };
        if (session.user.role !== 'admin') {
            query.createdBy = session.user.id;
        }

        const client = await Client.findOne(query);
        if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

        return NextResponse.json(client);
    } catch (error) {
        console.error("Fetch client error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const resolvedParams = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        await dbConnect();

        const query = { _id: resolvedParams.id, isActive: true };
        if (session.user.role !== 'admin') {
            query.createdBy = session.user.id;
        }

        const client = await Client.findOneAndUpdate(query, body, { new: true });
        if (!client) return NextResponse.json({ error: "Client not found or unauthorized" }, { status: 404 });

        return NextResponse.json(client);
    } catch (error) {
        console.error("Update client error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const resolvedParams = await params;
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const query = { _id: resolvedParams.id, isActive: true };
        if (session.user.role !== 'admin') {
            query.createdBy = session.user.id;
        }

        const client = await Client.findOneAndUpdate(query, { isActive: false }, { new: true });
        if (!client) return NextResponse.json({ error: "Client not found or unauthorized" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete client error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
