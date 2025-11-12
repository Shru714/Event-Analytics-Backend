const useragent = require('useragent');

function parseUserAgent(userAgentString) {
  if (!userAgentString) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown'
    };
  }

  const agent = useragent.parse(userAgentString);

  return {
    browser: `${agent.family} ${agent.major || ''}`.trim(),
    os: `${agent.os.family} ${agent.os.major || ''}`.trim(),
    device: agent.device.family === 'Other' ? 'Desktop' : agent.device.family
  };
}

module.exports = { parseUserAgent };
