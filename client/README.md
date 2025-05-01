## Para iniciar primero ejecutamos

npm init -y

## instalamos express

npm install express

## Nodemon

npm install --save-dev nodemon

## instalamos cors

npm install cors

## Ejecutamos el servidor
npm run dev

# endpoint de ejemplo

{
  "nombre": "Matemática I",
  "anioDeCarrera": 2,
  "anio": "2025",
  "horario": "Lunes 08:00 - 12:00",
  "modalidad": "Presencial",
  "correlativas": [""],
  "notas": {
    "parcial1": 7,
    "parcial2": 8,
    "final": null
  },
  "eventos": [
    {
      "tipo": "Parcial",
      "numero": 1,
      "temasAEstudiar": "Funciones, límites",
      "estado": "En curso",
      "fechaEntrega": "2025-06-10"
    },
    {
      "tipo": "Trabajo Práctico",
      "numero": 2,
      "temasAEstudiar": "Proyecto de integración",
      "estado": "Pendiente",
      "fechaEntrega": "2025-05-15"
    }
  ]
}

# endpoint para dar de altas usuarios


- Método: POST

- URL: http://localhost:3000/login

- Headers: Content-Type: application/json

- Body (raw, JSON):

---
{
  "nombre": "usuarioEjemplo",
  "password": "miPasswordSecreta"
}
---

### GET, POST, PUT y DELETE a:

http://localhost:3000/materias

http://localhost:3000/materias/:id