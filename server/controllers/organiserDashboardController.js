import {
    getOrganiserDashboardData
} from "../models/organiserDashboardModel.js";

export const getOrganiserDashboard = async (
    req,
    res
) => {
    try {
        const organiserId =
            req.session.user.user_id;

        const dashboard =
            await getOrganiserDashboardData(
                organiserId
            );

        return res.status(200).json({
            success: true,
            ...dashboard
        });
    } catch (error) {
        console.error(
            "Get organiser dashboard error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,

                message:
                    error.status
                        ? error.message
                        : "Unable to load the organiser dashboard."
            });
    }
};