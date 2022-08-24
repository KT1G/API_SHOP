# COMPRAVENTA TECNOLOGÍA RETRO

## FUNCIONAMIENTO DE LA API.

Los requisitos de la API se encuentran en el archivo "

#### Iniciar la APP:

1. Instalar los node_modules con el comando **"npm install"**.
2. Crear el archivo ***.env*** y rellenar los datos basándonos en el archivo ***.env.example***. IMPORTANTE! Los datos de mailgun deben ser importados tal cual estan en el archivo ***.env.example***.
3. En el archivo ***.index*** principal de la app en la linea 28 se encuentran 1 función para la creación de la DDBB, para su uso debemos descomentarla antes de arrancar la aplicación. IMPORATANTE! Para evitar que la DDBB se sobrescriba con cada guardado es necesario comentar de nuevo la función.
4. Iniciar la app con el comando **"npm run dev"**.

#### Uso de las DDBB:

- La función *"initDB"* crea la DDBB con las distintas tablas necesarias para su uso, así como una serie de usuarios y productos para que se puedan hacer búsquedas más complejas entre otras funciones. Para vuestra comodidad dejamos activos los siguientes emails que ya están registrados en mailgun.

> "habfakerbuyer@yopmail.com" y "habfakerseller@yopmail.com"
y otros 3 de reserva "habfakeruser-example@yopmail.com" =&gt; IMPORTANTE! Sustituir la palabra example por un número entre 1-3.

A continuación se detallan los diferentes endpoints, tanto su funcionamiento como las diferentes validaciones.