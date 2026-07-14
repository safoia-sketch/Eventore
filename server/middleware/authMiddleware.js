// Allows access only when a user has an active session.
export const requireAuth = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({
            message: "You must log in to access this resource."
        });
    }

    next();
};

// Allows access only to specified roles.
//
// Example:
// allowRoles("organiser", "administrator")
export const allowRoles = (...allowedRoles) => {
    const normalizedRoles = allowedRoles.map((role) =>
        role.toLowerCase()
    );

    return (req, res, next) => {
        if (!req.session?.user) {
            return res.status(401).json({
                message: "You must log in to access this resource."
            });
        }

        const userRole = req.session.user.role.toLowerCase();

        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message:
                    "You do not have permission to access this resource."
            });
        }

        next();
    };
};

// Allows approved organisers to use organiser features.
export const requireApprovedOrganiser = (
    req,
    res,
    next
) => {
    if (!req.session?.user) {
        return res.status(401).json({
            message: "You must log in to access this resource."
        });
    }

    const user = req.session.user;

    if (user.role !== "organiser") {
        return res.status(403).json({
            message:
                "This resource is available only to organisers."
        });
    }

    if (!user.organiser_approved) {
        return res.status(403).json({
            message:
                "Your organiser account is waiting for administrator approval."
        });
    }

    next();
};