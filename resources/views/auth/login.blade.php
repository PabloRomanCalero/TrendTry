<link rel="stylesheet" href="{{asset('css/auth/login.css')}}">

<div class="main-login">
    <section class="section-login">
        <article class="article-login-img">
            <img src='{{asset("img/header/logo.png")}}' alt="Logo" />
        </article>
        <article class="article-login-form">
            <form action="{{route('login')}}" method="POST">
                @csrf
                <article class="titulo">
                    <h1>LOGIN</h1>
                </article>
                <article>
                    <label for="username">Nombre de usuario:</label>
                    <input type="text" name="username" id="username">
                </article>

                <article>
                    <label for="password">Contraseña:</label>
                    <input type="password" name="password" id="password">
                </article>
                <article class="article-boton">
                    <input class="boton" type="submit" name="enviar" value="Logearse">
                    <a class="boton" href="{{route('contacto')}}">Contraseña olvidada</a>
                </article>
                <article class="volver-inicio-login">
                    <a href="{{route('inicio')}}">Volver</a>
                </article>
                <article class="registro">
                    <a href="{{route('registro')}}">Crear cuenta</a>
                </article>
                <article class="errors">
                    @isset($error)
                    <p>{{$error}}</p>
                    @endisset
                </article>
                
            </form>
        </article>

    </section>
</div>