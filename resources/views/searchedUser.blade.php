<script type="text/javascript" src="{!! asset('js/searchedUser/searchedUser.js') !!}" defer></script>
<link rel="stylesheet" href="{{asset('css/searchedUser.css')}}"> 

@extends('layouts.layout')

@section('content')
    <section class="section-profile" id="section-profile">
        <div class="profile-info" id="profile-info">
        </div>
        <div class="profile-actions">
            <form id="followUserForm" method="POST" action="{{ route('followUser') }}" class="followUserForm">
                @csrf
                <input type="hidden" value="{{$user_id}}" name="searchedUserId" id="searchedUserId">
                <button type="submit" class="botonForm" id="followUserButton">Seguir</button>
            </form>

            <form id="unfollowUserForm" method="POST" action="{{ route('unfollowUser') }}" class="unfollowUserForm">
                @csrf
                @method('DELETE')
                <input type="hidden" value="{{$user_id}}" name="searchedUserId2" id="searchedUserId2">
                <button type="submit" class="botonForm" id="unfollowUserButton">Dejar de seguir</button>
            </form>
        </div>
        <div class="media-container" id="media-container"></div>
    </section>
@endsection
