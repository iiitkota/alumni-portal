module.exports = (io) => {
  io.on('connection', (socket) => {
    // Join a referral room
    socket.on('join_room', (referralId) => {
      socket.join(referralId);
    });
    // Leave room
    socket.on('leave_room', (referralId) => {
      socket.leave(referralId);
    });
  });
};
