import {
    cancelOwnedBooking,
    createSafeBooking,
    getBookingsForAttendee,
    getOwnedBookingById
} from "../models/bookingModel.js";

/*
|--------------------------------------------------------------------------
| Create booking
|--------------------------------------------------------------------------
*/

export const createBooking = async (req, res) => {
    try {
        const attendeeId =
            req.session.user.user_id;

        const {
            event_id: eventId,
            items,
            idempotency_key: idempotencyKey,
            simulated_outcome: simulatedOutcome =
                "successful"
        } = req.body;

        const result = await createSafeBooking({
            attendeeId,
            eventId,
            items,
            idempotencyKey,
            simulatedOutcome
        });

        if (result.duplicate) {
            return res.status(200).json({
                success:
                    result.booking.status
                    === "confirmed",

                duplicate: true,

                message:
                    "This checkout request was already processed.",

                ...result
            });
        }

        if (
            result.payment_status === "failed"
        ) {
            return res.status(200).json({
                success: false,
                duplicate: false,

                message:
                    "The simulated payment failed. No tickets were created and availability was not reduced.",

                ...result
            });
        }

        return res.status(201).json({
            success: true,
            duplicate: false,

            message:
                result.booking.total_amount === "0.00"
                    ? "Your free booking was confirmed."
                    : "Your test payment succeeded and the booking was confirmed.",

            ...result
        });
    } catch (error) {
        console.error(
            "Create booking error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,

                message:
                    error.status
                        ? error.message
                        : "Unable to complete the booking."
            });
    }
};
/*
|--------------------------------------------------------------------------
| Get owned booking details
|--------------------------------------------------------------------------
*/

export const getBookingById = async (
    req,
    res
) => {
    try {
        const attendeeId =
            req.session.user.user_id;

        const bookingId =
            Number(req.params.bookingId);

        if (
            !Number.isInteger(bookingId)
            || bookingId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const result =
            await getOwnedBookingById(
                bookingId,
                attendeeId
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Booking not found or you do not have permission to view it."
            });
        }

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error(
            "Get booking details error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,
                message:
                    error.status
                        ? error.message
                        : "Unable to load booking details."
            });
    }
};
/*
|--------------------------------------------------------------------------
| Get current attendee bookings
|--------------------------------------------------------------------------
*/

export const getMyBookings = async (
    req,
    res
) => {
    try {
        const attendeeId =
            req.session.user.user_id;

        const bookings =
            await getBookingsForAttendee(
                attendeeId
            );

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error(
            "Get attendee bookings error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,
                message:
                    error.status
                        ? error.message
                        : "Unable to load your bookings."
            });
    }
};


/*
|--------------------------------------------------------------------------
| Cancel owned booking
|--------------------------------------------------------------------------
*/

export const cancelBooking = async (
    req,
    res
) => {
    try {
        const attendeeId =
            req.session.user.user_id;

        const bookingId =
            Number(req.params.bookingId);

        const { reason = "" } = req.body;

        const result =
            await cancelOwnedBooking({
                bookingId,
                attendeeId,
                reason
            });

        return res.status(200).json({
            success: true,

            message:
                result.cancellation.refund_status
                === "simulated"
                    ? "Booking cancelled and the test payment was marked as refunded."
                    : "Booking cancelled successfully.",

            ...result
        });
    } catch (error) {
        console.error(
            "Cancel booking error:",
            error
        );

        return res
            .status(error.status || 500)
            .json({
                success: false,

                message:
                    error.status
                        ? error.message
                        : "Unable to cancel the booking."
            });
    }
};