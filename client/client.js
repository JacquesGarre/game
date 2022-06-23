
// Inits client
var io = io("http://localhost:3000");
const client = new Client(io);

// Binds server events listener 
client.addServerEventsListeners();

// Binds document events listener 
client.addDomEventsListeners();