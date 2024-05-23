<link rel="stylesheet" href="{{asset('css/auth/registro.css')}}">
<div class="main-registro">
    <section class="section-registro">
        <article class="article-registro-img">
            <img src= '{{asset("img/header/logo.png")}}' width="200px" heigth="200px" alt="Logo"/>
        </article>
        <article class="article-registro-form">
            <form action="{{route('registro')}}" method="POST">
                @csrf
                    <h1>REGISTRO</h1>
                    <div>
                        <label for="name">Nombre</label>
                        <input type="text" name="name" id="name">
                    </div>
                    <div>
                        <label for="surname">Primer apellido</label>
                        <input type="text" name="surname" id="surname">
                    </div>
                    <div>
                        <label for="surname2">Segundo Apellido</label>
                        <input type="text" name="surname2" id="surname2" placeholder="Opcional">
                    </div>
                    <div>
                        <label for="username">Nombre de Usuario</label>
                        <input type="text" name="username" id="username">
                    </div>
                    <div>
                        <label for="dni">DNI</label>
                        <input type="text" name="dni" id="dni">
                    </div>
                    <div>
                        <label for="email">Email:</label>
                        <input type="email" name="email" id="email">
                    </div>
                    <div>
                        <label for="password">Contraseña</label>
                        <input type="password" name="password" id="password">
                    </div>
                    <div>
                        <label for="password-confirmation">Confirmar contraseña</label>
                        <input type="password" name="password-confirmation" id="password-confirmation">
                    </div>
                    <div>
                        <label for="phone">Numero de telefono</label>
                        <input type="number" name="phone" id="phone">
                    </div>
                    <div>
                        <label for="birthdate">Fecha de nacimiento</label>
                        <input type="date" name="birthdate" id="birthdate">
                    </div>
                    <div class="div-botonEnviar">
                        <input class="botonEnviar" type="submit" name="enviar" value="Registrarse">
                    </div>
                    <div class="volver-inicio-registro">
                        <a href="{{route('inicio')}}">Volver</a>
                    </div>

                </form>

                @if($errors->any())
                    <ul>
                        @foreach ($errors->all() as $error )
                            <li>{{$error}}</li>
                        @endforeach
                    </ul>
                @endif

        </article>
    </section>
</div>

