<?php

namespace App\Http\Controllers;

use App\Models\Followers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class FollowersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function followUser(Request $request)
    {
        $follower = new Followers();
        $authUserid = Auth::user()->id;
        $user_id = $request->get('searchedUserId');
        $follower->user_id = $user_id;
        $follower->follower_id = $authUserid;
        $follower->save();
       
        return view('searchedUser', compact('user_id'));
    }

    public function unfollowUser(Request $request)
    {
        $authUserId = Auth::user()->id;
        $user_id = $request->get('searchedUserId2');
        $followers = Followers::where('user_id', $user_id)->where('follower_id', $authUserId);
        $followers->delete();
        return view('searchedUser', compact('user_id'));
    }
}
