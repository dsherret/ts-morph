# Structure to Texts

Over time, the code for converting structures to text should be moved here.

## Refactor Outline

1. Move all writing here.
2. Write everything in these classes so that "fill" methods are not necessary to use (they're slow).

Once that's done:

3. Remove using "fill" methods when writing in the other code.
4. Unit test these classes. This effort could start now, but it's low priority because the other tests cover this when using the "fill" methods.
