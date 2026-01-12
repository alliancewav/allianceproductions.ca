Create A Fade Out Overflow Effect Using CSS Mask-Image
July 2nd, 2021
Learn how to create an overflow fade out effect using CSS mask-image. This helps indicate to the user that there’s more content to be seen. Masking is very useful when overflowing content that’s placed over an image or a non-uniform background.

Let’s take a look at the example below. When scrolling the custom scrollbar we can see that the content area overlows and the content is faded out.

Lorem Ipsum
What is Lorem Ipsum?
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.



It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Where does it come from?
Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.

Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

The HTML used for this effect is a normal block-level element that can have any kind of content.

Snap picture
Copy
<div class="masked-overflow">
    <p>What is Lorem Ipsum?</p>
</div>
Then using CSS we apply the mask.

Copy
.masked-overflow {
    /* scroll bar width, for use in mask calculations */
    --scrollbar-width: 8px;

    /* mask fade distance, for use in mask calculations */
    --mask-height: 32px;

    /* If content exceeds height of container, overflow! */
    overflow-y: auto;

    /* Our height limit */
    height: 300px;

    /* Need to make sure container has bottom space,
  otherwise content at the bottom is always faded out */
    padding-bottom: var(--mask-height);

    /* Keep some space between content and scrollbar */
    padding-right: 20px;

    /* The CSS mask */

    /* The content mask is a linear gradient from top to bottom */
    --mask-image-content: linear-gradient(
        to bottom,
        transparent,
        black var(--mask-height),
        black calc(100% - var(--mask-height)),
        transparent
    );

    /* Here we scale the content gradient to the width of the container 
  minus the scrollbar width. The height is the full container height */
    --mask-size-content: calc(100% - var(--scrollbar-width)) 100%;

    /* The scrollbar mask is a black pixel */
    --mask-image-scrollbar: linear-gradient(black, black);

    /* The width of our black pixel is the width of the scrollbar.
  The height is the full container height */
    --mask-size-scrollbar: var(--scrollbar-width) 100%;

    /* Apply the mask image and mask size variables */
    mask-image: var(--mask-image-content), var(--mask-image-scrollbar);
    mask-size: var(--mask-size-content), var(--mask-size-scrollbar);

    /* Position the content gradient in the top left, and the 
  scroll gradient in the top right */
    mask-position: 0 0, 100% 0;

    /* We don't repeat our mask images */
    mask-repeat: no-repeat, no-repeat;
}
Note that you should either use autoprefixer or prepend the mask properties with -moz- and -webkit- to make them work.

We need these two mask images because when a mask is applied, transparent pixels in the mask are the pixels that become masked. When applying only the content mask the scrollbar gets masked as well because the pixels behind it are transparent.

While the scrollbar still works, visually it’s not that attractive.

Our --mask-image-scrollbar paints a set of black opaque pixels behind the scroll area making the scrollbar always visible.

The custom scrollbar is created with this CSS, we use the current text color as scrollbar color.

Snap picture
Copy
/* Firefox */
.masked-overflow {
    scrollbar-width: thin; /* can also be normal, or none, to not render scrollbar */
    scrollbar-color: currentColor transparent; /* foreground background */
}

/* Webkit / Blink */
.masked-overflow::-webkit-scrollbar {
    width: var(--scrollbar-width);
}

.masked-overflow::-webkit-scrollbar-thumb {
    background-color: currentColor;
    border-radius: 9999px; /* always round */
}

.masked-overflow::-webkit-scrollbar-track {
    background-color: transparent;
}