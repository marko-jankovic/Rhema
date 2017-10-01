'use strict';

const Controller = require('../baseController');

// route triggered from clientSideError.html
// when window.onerror is emitted
class ClientSideErrorController extends Controller {
    storeAction (req, res) {
        try {
            const data = JSON.parse(req.body.data);
            const agenet = `- User-Agent: ${req.getUserAgent()}`;
            const deviceInfo = `- Device: ${data.width}x${data.height} px`;
            const errorMsg = `"${data.message}", ${data.fileName} at line: ${data.lineNumber}::${data.column} - url: ${data.url}`;

            logger.error('Client Side Error:', errorMsg, agenet, deviceInfo);
            metrics.increment('ClientSide.Error');
        } catch (e) {
            //
        }

        res.end();
    }
}

module.exports = ClientSideErrorController;
