module.exports = {
    messageParser: function(buf) {
        if (buf.length != 8) return null;

        return {
            id: buf.readUInt16BE(0),
            key: buf.readUInt16BE(2),
            value: buf.readInt32BE(4),
            raw: buf,
        };
    }
};