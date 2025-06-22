import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users } from "lucide-react";

const CustomerMatrix = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Customer Intelligence Matrix
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Customer intelligence coming soon...</p>
            </CardContent>
        </Card>
    );
};

export default CustomerMatrix; 