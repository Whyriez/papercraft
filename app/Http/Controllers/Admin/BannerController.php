<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:papercraft,custom',
            'papercraft_id' => 'required_if:type,papercraft|nullable|exists:papercrafts,id',
            'title' => 'required_if:type,custom|nullable|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'image' => 'required_if:type,custom|nullable|image|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('banners', 'public');
        }

        Banner::create([
            'type' => $request->type,
            'papercraft_id' => $request->type === 'papercraft' ? $request->papercraft_id : null,
            'title' => $request->type === 'custom' ? $request->title : null,
            'link_url' => $request->type === 'custom' ? $request->link_url : null,
            'image_path' => $imagePath,
        ]);

        return redirect()->back();
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        if ($banner->image_path) {
            Storage::disk('public')->delete($banner->image_path);
        }
        $banner->delete();

        return redirect()->back();
    }
}
