# COMPRAVENTA TECNOLOGÍA RETRO

## Uso y Características de la API

Los requisitos que se piden para la creación de la API se encuentran en el archivo ***Requisitos.md***

#### Iniciar la APP

------------
1. Instalar los node_modules con el comando **"npm install"**.
2. Crear el archivo ***.env*** y rellenar los datos basándonos en el archivo ***.env.example***. IMPORTANTE! Los datos de mailgun deben ser importados tal cual estan en el archivo ***.env.example***.
3. En el archivo ***.index*** principal de la app en la linea 28 se encuentran 1 función para la creación de la DDBB, para su uso debemos descomentarla antes de arrancar la aplicación. IMPORATANTE! Para evitar que la DDBB se sobrescriba con cada guardado es necesario comentar de nuevo la función.
4. Iniciar la app con el comando **"npm run dev"**.

#### Uso de las DDBB

------------

- La función *"initDB"* crea la DDBB con las distintas tablas necesarias para su uso, así como una serie de usuarios y productos para que se puedan hacer búsquedas más complejas entre otras funciones. Para vuestra comodidad dejamos activos los siguientes emails que ya están registrados en mailgun.

> "habfakerBraian@yopmail.com" y "habfakerLuis@yopmail.com" para probar los endpoints de creación y activación de los usuarios así como el resto de endpoints. y otros 3 "habfakeruser-example@yopmail.com" que ya están activados en la base de datos en los que se cargan los diferentes productos. IMPORTANTE! Sustituir la palabra example por un número entre 1-3.

### Uso de la API
------------
#### Postman
En los archivos de la API se encuentra el archivo" " el cual deberemos importar en nuestro postman personal para probar los diferentes endpoints. Se recomienda configurar las variables de entorno para una mejor experiencia de usuario.

#### ENDPOINTS

A continuación se detallan los diferentes endpoints, tanto su funcionamiento como las diferentes validaciones.
#### Accounts

- **Create Account**: URL del postman => **/api/accounts**.

Este endpoint se encarga de la creacion del usuario, para ello devemos enviar por el body con el formato **raw** un objeto tipo **JSON** con los siguientes parametros.

- name: "David"
- email: " habfakerBraian@yopmail.com"
- password: "mypassword"

Si el usuario se crea con éxito se enviará un email de activación al correo especificado.

Para la activación de la cuenta debemos copiar el link que se nos envía y pegarlo en alguna ruta del postman o directamente en el navegador.

**VALIDACIONES**

1. - Validamos que la URL sea la correcta.
2. - Validamos los datos que nos llegan por el body, comprobamos que se hayan especificado los tres campos y que los datos sean correctos.
3. - Comprobamos que el usuario no exista en la bbdd.
4. - Comprobamos que el email se envíe con éxito.

------------
- **Deleted Account**: 
   -**Delete My Account** URL del postman => **/api/accounts/delete**.
   En este endpoint un usuario logeado puede borrar su cuenta.
   Al hacerlo elimina todo su rastro de la base de datos, por efecto cascada desaparecen los likes, bookings, products, user y los directorios de las fotos de sus productos y de su avatar
   -**Delete Account By Id** URL del postman => **/api/accounts/delete/byId/:id**
   En este endpoint un usuario logeado y que sea **Admin** puede borrar 1 o mas cuentas concatenando el id de cada una '1-2-3-4', con las mismas consecuencias que en **Delete Account By Id**
   -**Delete Account By Admin** URL del postman => **/api/accounts/delete/byAdmin**
   En este endpoint un usuario logeado y que sea **Admin** puede borrar todas las cuentas de usuarios que no sean **Admin**, con las mismas consecuencias que en **Delete Account By Id**

**VALIDACIONES**

1. - Validamos que la URL sea la correcta.
2. - Validamos los datos que nos llegan por params, comprobamos que los datos sean correctos con una funcion de Validacion.
3. - Comprobamos que el usuario esta borrando su propia cuenta o si es **Admin**.
4. - Preparamos las rutas de las fotos de productos y avatar.
5. - Procedemos al borrado
6. - Actualizamos en la columna **loves**, el numero likes dados por los usuarios ya que al borrar cuentas  desaparecen productos de las tablas likes, bookings y products. Como consecuencia el usuario tiene menos productos en su lista de likes
------------

#### Auth

- **Authorization**: URL del postman => **/api/auth**.

En este endpoint comprobamos y permitimos que un usuario se logue en la APP. Para ello debemos insertar por el body con el formato **raw** un objeto tipo **JSON** con los siguientes parámetros.

- email:"habfakerBraian@yopmail.com"
- password: "mypassword"

Si el usuario se loguea con este, se le devolverá por la respuesta un objeto con un token de acceso, el cual le permitirá permanecer conectado por un determinado periodo de tiempo.

**VALIDACIONES**

1. - Comprobamos que la URL sea la correcta.
2. - Validamos los datos que nos llegan por el body. Comprobamos que se hayan especificado los 2 campos y que los datos sean correctos.
3. - Comprobamos que el usuario tenga la cuenta activada para logearse.
4. - Validamos la contraseña con el bcrypt.

------------

#### Products

- **Create Product**: URL del postman => **/api/products**.

En este endpoint nos encargamos de publicar un producto para ponerlo a la venta. El usuario debe está logueado por lo que tenemos que utilizar el endpoint de **Auth** para generar un token y meterlo en los headers de esta ruta, ya sea de manera manual o a través de las variables de entorno.

Para publicar un producto debemos introducir por el body con el formato **form-data** los siguientes parámetros.

- image: "iphone.jpeg" (required). *Formatos validos de imagen.
- name : example => " Pc gaming MSI". (required).
- category: example => " desktop" (required) *Categorías Válidas.
- price: example => "400" (required).
- location: "Coruña " (required).
- caption: "Ordenador portatil MSI ".

> **Categorías Válidas:** 'desktop', 'notebook' ,' tablet', 'smatphone', 'ebook', smartwhatch', 'console'' 'tv', 'camera', 'mouse', 'keyboard', 'headset', 'speaker', 'printer', 'scanner', 'charger',

> **Formatos válidos de imagen**: 'jpeg', 'png'.

Si el usuario consigue introducir de manera correcta los datos y el token, un nuevo producto se pondrá a la venta con éxito y se enviará como respuesta un mensaje con el ID del producto que se acaba de publicar.

**VALIDACIONES**

1. - Comprobamos que la URL sea la correcta.
2. - Comprobamos que el usuario este logueado.
3. - Validamos los datos que nos llegan por el body. Comprobamos que se hayan especificado todos los datos requeridos, y que los datos introducidos sean correctos y estén dentro de las categorías y formatos válidos.
4. - Comprobamos que no se exceda el límite de publicaciones por usuarios.

------------
- **Buy Product**: URL del postman => **/api/products/"ID del producto a comprar"/buy**.

En este endpoint solicitamos la compra de un producto por parte de un usuario. Para ello debe estar registrado y en este caso introducir la ID del producto que desea comprar.

Para solicitar la compra de un producto debemos introducir por la query el ID del producto.

 > Ejemplo: http://localhost:9000/api/products/24/buy.

Si el usuario consigue realizar la solicitud de compra correctamente, se enviará un correo electrónico al vendedor del producto con un enlace para confirmar la compra.

**VALIDACIONES**

1. - Comprobamos que la URL sea la correcta.
2. - Comprobamos que el usuario este logueado.
3. - Validamos el ID que nos llega por los params.
4. - Comprobamos que la persona que solicita la compra del producto, no sea la misma que lo publicó.
5. - Comprobamos que el producto no haya sido vendido.

------------
- **Get Products**:
   -**Get All Products** URL del postman => **/api/products**.
   En este endpoint
   -**Get Product By Id**URL del postman => **/api/products/filterBy/id/:id**.
   En este endpoint
   -**Get Product By Id**URL del postman => **/api/products/filterBy/category/:category**
   En este endpoint
   -**Get Product By Id**URL del postman => **/api/products/filterBy/userId/:userId**
   En este endpoint
   
   **VALIDACIONES**

1. - Comprobamos que la URL sea la correcta.
2. - Validamos los datos que nos llegan por params y queryStrings. comprobamos que los datos sean correctos con una funcion de Validacion.
3. - .
