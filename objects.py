vertices = []
faces = []

with open('./OpenGlPipelineBased_Webpacked/models/finish_non_cut_rotated.obj', encoding = 'utf-8') as f:
    for line in f:
        if line[0] == 'v':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            splitted.pop(0)

            vertices.append(splitted)
        elif line[0] == 'f':
            line = line.replace('\n', '')
            splitted = line.split(' ')
            splitted.pop(0)


            faces.append(splitted)


# print(vertices)
str_vertices = str(vertices)
str_vertices = str_vertices.replace(' ', '')
str_faces = str(faces)
str_faces = str_faces.replace(' ', '')
print(str_faces)
print(str_vertices)
print('blablabla;')