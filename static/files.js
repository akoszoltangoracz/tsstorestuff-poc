const FileItem = Vue.component('file-item', {
  props: ['file'],
  template: `<tr>
    <td>
      <img v-if="!!file.presignedThumb" :src="file.presignedThumb" />
    </td>
    <td><a :href="'/api/files/' + file._id + '/download'" target="_blank">{{file.name}}</a></td>
    <td>{{file.status}}</td>
    <td>{{file.size}}</td>
    <td>{{file.lastModified}}</td>
  </tr>`
});

const FileTags = Vue.component('file-tags', {
  template: `<div></div>`,
});

const FilesPage = Vue.component('files-page', {
  template: `
    <div>
      <page-header />
      <h1>Files</h1>
      <button @click.prevent="handleRefresh">Refresh</button>
      <table>
        <thead></thead>

        <tbody>
          <file-item v-for="file in files.list" :key="file._id" :file="file" />
        </tbody>
      </table>

      <upload-page />
    </div>
  `,
  computed: {
    ...Vuex.mapState([
      'files',
    ]),
  },
  methods: {
    ...Vuex.mapActions([
      'listFiles',
    ]),
    async handleRefresh() {
      await this.listFiles();
    },
  },
  async mounted() {
    await this.listFiles();
  },
});

const UploadPage = Vue.component('upload-page', {
  template: `<div>
    <h2>Upload file</h2>
    <input type="file" id="fileField"/>
    <button @click.prevent="handleUpload">Upload</button>
  </div>`,
  methods: {
    async handleUpload() {
      const elem = document.getElementById('fileField');
      const file = elem.files[0];
      console.log(file);
      console.log('uploading');

      const { data: apiResult } = await axios.post('/api/files', {
        name: file.name,
      });

      console.log('api result', apiResult);

      const { data: minioResponse } = await fetch(apiResult.url,
        {
          method: 'PUT',
          body: file,
        });

      console.log(minioResponse);

      const { data: finalizeResponse } = await axios.post(`/api/files/${apiResult.id}/finalize`, {});
      console.log(finalizeResponse);
    
      elem.value = null;
    },
  }
});

const FileUpload = Vue.component('file-upload', {
  template: `<div></div>`,
});

const FileUpdate = Vue.component('file-edit', {
  template: `<div></div>`,
});
