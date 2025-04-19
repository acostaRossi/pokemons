const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs');

const portNumber = 3000;
const ipAddress = '127.0.0.1';

function getAbsoluteUrl(uri) {
  return 'http://' + ipAddress + ':' + portNumber + '/' + uri;
}

// nuova app EXPRESS
const app = express();

app.locals.baseUrl = getAbsoluteUrl('');

// Configura la directory per i file statici (css, js)
app.use(express.static('public'))

// Middleware che automaticamente effettua il parsing dei parametri
// inviati via HTTP dal form e crea un oggetto JS che li contiene
app.use(express.urlencoded({ extended: true }));

// ejs è il Template Engine che consente di fondere HTML e JS server side
app.set('view engine', 'ejs');

// Configura connessione al DB MySQL
const db = mysql.createConnection({
  host: '10.211.55.3',
  user: 'root',        // <-- cambia con il tuo utente
  password: '',        // <-- cambia con la tua password
  database: 'pokemons_db' // <-- nome del tuo database
});

// Crea la connessione al database
db.connect((err) => {
  if (err) {
    console.error('Errore di connessione al database:', err);
    return;
  }
  console.log('Connesso al database MySQL!');
});

// Route: GET /pokemons
app.get(['/', '/pokemons'], (req, res) => {
  // scrivi la query
  const sql = 'SELECT * FROM pokemon ORDER BY pok_id DESC';
  // esegui la query
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send('Errore durante la query.');
      return;
    }
    // mostra i risultati usando la pagina index.ejs
    res.render('index', { pokemons: results })
  });
});

// Route: GET /new-pokemon
app.get('/new-pokemon', (req, res) => {
  // mostra i risultati usando la pagina new-pokemon.ejs
  res.render('new-pokemon', {})
});

// Route: POST /new-pokemon
app.post('/new-pokemon', (req, res) => {

  // il server riceve ed estrae i parametri compilati nel form dall'utente
  // ed inviati via HTTP (method POST)
  let pok_name = req.body.name;
  let pok_height = parseInt(req.body.height);
  let pok_weight = parseInt(req.body.weight);
  let pok_base_experience = parseInt(req.body.base_experience);

  // creo un array con i valori da inserire a DB
  let values = [
    pok_name,
    pok_height,
    pok_weight,
    pok_base_experience
  ]

  // query sql di inserimento
  // i punti di domanda verranno sostituiti con i dati dell'array
  const sql = `
    INSERT INTO pokemon (pok_id, pok_name, pok_height, pok_weight, pok_base_experience)
    VALUES (NULL, ?, ?, ?, ?)`;

  // esecuzione della query sql INSERT
  db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Errore nell\'inserimento:', err);
        res.status(500).send('Errore nel salvataggio');
      } else {
        // mostra i risultati usando la pagina new-pokemon.ejs
        res.render('new-pokemon', { success: true, pok_name: pok_name })
      }
    });
});

// Route: GET /new-pokemon
app.get('/delete-pokemon/:pokemonId', (req, res) => {
  const pokId = parseInt(req.params.pokemonId);
  let values = [ pokId ];
  // scrivi la query
  const sql = 'DELETE FROM pokemon WHERE pok_id = ?';
  // esegui la query
  db.query(sql, values, (err, result) => {
    if (err) {
      res.status(500).send('Errore durante la query.');
    } else {
      // redirect homepage
      res.redirect(getAbsoluteUrl('pokemons'));
    }
  });
});

// Route: GET /new-pokemon
app.get('/edit-pokemon/:pokemonId', (req, res) => {
  const pokId = parseInt(req.params.pokemonId);
  let values = [ pokId ];
  // scrivi la query
  const sql = 'SELECT * FROM pokemon where pok_id = ?';
  // esegui la query
  db.query(sql, values, (err, results) => {
    if (err) {
      res.status(500).send('Errore durante la query.');
      return;
    }
    // mostra i risultati usando la pagina index.ejs
    res.render('edit-pokemon', { pokemon: results[0] })
  });
});

// Route: POST /new-pokemon
app.post('/edit-pokemon/:pokemonId', (req, res) => {

  let pokId = parseInt(req.params.pokemonId);

  // il server riceve ed estrae i parametri compilati nel form dall'utente
  // ed inviati via HTTP (method POST)
  let pok_name = req.body.name;
  let pok_height = parseInt(req.body.height);
  let pok_weight = parseInt(req.body.weight);
  let pok_base_experience = parseInt(req.body.base_experience);

  // creo un array con i valori da inserire a DB
  let values = [
    pok_name,
    pok_height,
    pok_weight,
    pok_base_experience,
    pokId
  ]

  // query sql di inserimento
  // i punti di domanda verranno sostituiti con i dati dell'array
  const sql = `
    UPDATE pokemon
    SET pok_name = ?, pok_height = ?, pok_weight = ?, pok_base_experience = ?
    WHERE pok_id = ?`;

  // esecuzione della query sql INSERT
  db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Errore nell\'inserimento:', err);
        res.status(500).send('Errore nel salvataggio');
      } else {
        let values = [ pokId ];
        // scrivi la query
        const sql = 'SELECT * FROM pokemon where pok_id = ?';
        // esegui la query
        db.query(sql, values, (err, results) => {
          if (err) {
            res.status(500).send('Errore durante la query.');
            return;
          }
          // mostra i risultati usando la pagina index.ejs
          res.render('edit-pokemon', { success: true, pokemon: results[0] })
        });
      }
    });
});

// Avvio Web Server nella porta 3000 e IP 127.0.0.1
app.listen(portNumber, ipAddress, () => {
  console.log('Server avviato su http://' + ipAddress + ':' + portNumber + '/pokemons');
});
